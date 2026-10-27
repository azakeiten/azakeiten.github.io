#!/usr/bin/perl
# split-css.pl — site.min.css（全部入り）から、ページごとに「そのページで使うルールだけ」の p-〈ページ名〉.min.css を作る
#  ・ルールのクラス名が、すべて別のページ（HTML と、そのページが読む JS）にしか出てこないものだけを外す
#  ・クラスのないルール、どのページにも見つからないルールは、どのページにも残す（安全側）
#  ・ルールの順番はもとのまま（上書きの関係が変わらない）。@media の中も同じ。@keyframes などはそのまま
#  ・各ページの HTML の CSS の <link> を、自分の p-〈ページ名〉.min.css に向ける（site.min.css は全部入りとして残す）
use strict; use warnings;
local $/;
open my $in, '<:utf8', 'site.min.css' or die; my $css = <$in>; close $in;

# --- ページごとに、出てくる言葉（クラス名の候補）を集める ---
my %tok;   # page => { token => 1 }
my @pages = grep { !/^(offline|sponsor-kit)\.html$/ } glob('*.html');
sub slurp { my $f = shift; open my $h, '<:utf8', $f or return ''; my $t = <$h>; close $h; return $t; }
for my $p (@pages) {
  my $text = slurp($p);
  my %seen; my @js = ($text =~ /([a-z0-9-]+\.js)\b/g);
  # そのページの JS が、あとから読みこむ JS（例：wordmap.js）も 1 段だけたどる
  my @more;
  for my $j (@js) { next if $seen{$j}++; my $t = slurp($j); $text .= $t; push @more, ($t =~ /'([a-z0-9-]+\.js)/g); }
  for my $j (@more) { next if $seen{$j}++; $text .= slurp($j); }
  $tok{$p}{$_} = 1 for ($text =~ /[A-Za-z_][\w-]*/g);
}

# --- CSS を、いちばん外側の固まりに分ける ---
sub blocks {   # 文字列 → [前置き, 中身] の並び（中身は { } の中）
  my $s = shift; my @out; my ($d, $start, $o) = (0, 0, 0);
  while ($s =~ /([{}])/g) {
    my $p = pos($s) - 1;
    if ($1 eq '{') { $o = $p if $d == 0; $d++; }
    else { $d--; if ($d == 0) { push @out, [substr($s, $start, $o - $start), substr($s, $o + 1, $p - $o - 1)]; $start = $p + 1; } }
  }
  return @out;
}
sub split_sel {   # カンマで分ける（かっこの中のカンマは無視）
  my $s = shift; return split /,/, $s if index($s, '(') < 0;
  my @r; my $d = 0; my $cur = '';
  for my $c (split //, $s) { $d++ if $c eq '('; $d-- if $c eq ')'; if ($c eq ',' && !$d) { push @r, $cur; $cur = '' } else { $cur .= $c } }
  push @r, $cur; return @r;
}
sub users {   # このルールを使うかもしれないページの集まり（undef = すべてのページ）
  my $sel = shift; my %pg;
  for my $one (split_sel($sel)) {
    # :not() :is() :where() :has() の中のクラスは「なくてもよい」ので数えない（例：html:not(.is-apple) は、トップ以外の全ページ）
    1 while $one =~ s/:(?:not|is|where|has)\([^()]*\)//g;
    my @cls = ($one =~ /\.([A-Za-z_][\w-]*)/g);
    return undef unless @cls;   # クラスのない部分がある → すべてのページ
    for my $p (@pages) { $pg{$p} = 1 if !grep { !$tok{$p}{$_} } @cls; }
  }
  return %pg ? \%pg : undef;    # どこにも見つからない → 念のため、すべてのページ
}
my %out; $out{$_} = '' for @pages;
my $add = sub { my ($u, $t) = @_; for my $p (@pages) { $out{$p} .= $t if !$u || $u->{$p} } };
for my $b (blocks($css)) {
  my ($pre, $body) = @$b; (my $p = $pre) =~ s/^\s+|\s+$//g;
  if ($p =~ /^\@media/) {
    my %in; $in{$_} = '' for @pages;
    for my $r (blocks($body)) { my $u = users($r->[0]); my $t = "$r->[0]\{$r->[1]\}"; for my $q (@pages) { $in{$q} .= $t if !$u || $u->{$q} } }
    for my $q (@pages) { $out{$q} .= "$pre\{$in{$q}\}" if $in{$q} ne '' }
  } elsif ($p =~ /^\@/) { $add->(undef, "$pre\{$body\}"); }
  else { $add->(users($pre), "$pre\{$body\}"); }
}
unlink glob('p-*.min.css');
for my $p (@pages) {
  (my $name = $p) =~ s/\.html$//; my $file = "p-$name.min.css";
  open my $o, '>:utf8', $file or die; print $o $out{$p}; close $o;
  my $html = slurp($p);
  $html =~ s{\n[ \t]*<link rel="stylesheet" href="p-[\w-]+\.min\.css[^>]*>(?=\n)}{}g if $html =~ /href="site\.min\.css/;   # 前のやり方の名残を外す
  $html =~ s{href="(?:site|p-[\w-]+)\.min\.css\?v=}{href="$file?v=};
  open my $oh, '>:utf8', $p or die; print $oh $html; close $oh;
  printf "  %-24s %7d bytes\n", $file, length($out{$p});
}
printf "  site.min.css（全部入り）  %7d bytes\n", length($css);
