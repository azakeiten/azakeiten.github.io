#!/usr/bin/perl
# humanize.pl — VOICEVOX の audio_query（q.json）を、人の話し方に近づける（2026.11.24）
#   perl humanize.pl 役 名前 < q.json > q2.json
#   役：m＝お札マン（元気に）、n＝ナレーション・案内（落ち着いて、はっきり）、p＝つなぎ合わせる数の部品（文の終わりの下げをしない）
# やっていること
#   ・抑揚を少し大きく（棒読みにならないように）。速さ・間・前後の無音を整える
#   ・文ごとに、速さと抑揚と高さを、ほんの少しずつ変える（名前から決めるので、何度作っても同じ）
#   ・文の終わりの音を少しのばして、少し下げる（人は文の終わりで、ゆっくり・低くなる）※ 問いかけの文はそのまま
#   ・読点（、）の間を少し長く。読点の直前の音も、わずかにのばす
use strict; use warnings; use JSON::PP;
my ($role, $name) = @ARGV;
local $/; my $q = decode_json(<STDIN>);
my $h = 0; $h = ($h * 31 + ord($_)) % 1000003 for split //, ($name // '');
my $r = sub { my $k = shift; (((($h >> $k) ^ ($h * 7 + $k)) % 1000) / 1000 - 0.5) };   # -0.5〜0.5
my %base = $role eq 'm'
  ? (speedScale => 1.06, intonationScale => 1.22, pitchScale => 0.0, pause => 1.1, pre => 0.06, post => 0.12)
  : (speedScale => 1.02, intonationScale => 1.18, pitchScale => 0.0, pause => 1.25, pre => 0.08, post => 0.16);
$q->{speedScale} = $base{speedScale} + 0.04 * $r->(1);
$q->{intonationScale} = $base{intonationScale} + 0.10 * $r->(3);
$q->{pitchScale} = $base{pitchScale} + 0.012 * $r->(5);
$q->{prePhonemeLength} = $base{pre};
$q->{postPhonemeLength} = $base{post};
$q->{pauseLengthScale} = $base{pause} if exists $q->{pauseLengthScale};
my @ap = @{ $q->{accent_phrases} || [] };
for my $i (0 .. $#ap) {
  my $p = $ap[$i]; my @m = @{ $p->{moras} || [] }; next unless @m;
  my $last = $m[-1];
  if ($p->{pause_mora}) {   # 読点：間を少し長く、直前の音をわずかにのばす
    $p->{pause_mora}{vowel_length} *= ($role eq 'm' ? 1.1 : 1.2);
    $last->{vowel_length} *= 1.08 if $last->{vowel_length};
  }
  if ($i == $#ap && !$p->{is_interrogative} && $role ne 'p') {   # 文の終わり（つなぎ合わせる数の部品 p はそのまま）
    $last->{vowel_length} *= 1.16 if $last->{vowel_length};
    $last->{pitch} -= 0.10 if $last->{pitch} > 0;
    if (@m > 1 && $m[-2]{pitch} > 0) { $m[-2]{pitch} -= 0.04; $m[-2]{vowel_length} *= 1.05 if $m[-2]{vowel_length}; }
  }
}
print encode_json($q);
