use utf8;
use open qw(:std :utf8);
use JSON::PP;
# 文に分ける（voice.js の split と同じ）・印（FNV-1a、36 進）・読み（voice.js の READ を、そのまま perl でかける）
local $/;
my ($srcf, $voicejs) = @ARGV;
open my $f, '<', $srcf or die; my $src = JSON::PP->new->decode(<$f>); close $f;
open $f, '<', $voicejs or die; my $vj = <$f>; close $f;
my ($read) = $vj =~ /const READ = \[\n(.*?)\n  \];/s or die 'READ';
my @R;
while ($read =~ /\[\/((?:\\.|[^\/\\])+)\/(g?),\s*'((?:\\.|[^'\\])*)'\]/g) {
  my ($re, $rep) = ($1, $3);
  $re =~ s/\\x00-\\x7F/\\x{00}-\\x{7F}/g;
  push @R, [qr/$re/, $rep];
}
sub fix { my $s = shift; for my $r (@R) { my $rep = $r->[1]; $s =~ s/$r->[0]/my @c = ($1, $2); my $t = $rep; $t =~ s{\$1}{defined $c[0] ? $c[0] : ''}ge; $t =~ s{\$2}{defined $c[1] ? $c[1] : ''}ge; $t/ge; } $s }
sub split_s { my $t = shift; $t =~ s/\s+/ /g; return grep { length } map { s/^\s+|\s+$//gr } split /(?<=[。！？])/, $t; }
sub h36 { my $x = 0x811c9dc5; for my $ch (split //, shift) { $x ^= ord($ch); $x = ($x * 0x01000193) & 0xffffffff; } my $s = ''; do { $s = (0..9, 'a'..'z')[$x % 36] . $s; $x = int($x / 36); } while ($x); $s }
my (%seen, @plan);
for my $it (@$src) {
  my ($role, $text) = @$it;
  for my $s (split_s($text)) {
    my $name = "$role-" . h36($s);
    next if $seen{$name}++;
    push @plan, [$name, $s, fix($s) =~ s{(?<=[^\x00-\x7F])\s+|\s+(?=[^\x00-\x7F])}{}gr];  # 日本語の前後の空白は消す（間があいて読まれないように）
  }
}
print JSON::PP->new->utf8(0)->canonical->pretty->encode(\@plan);
print STDERR scalar(@R), " rules, ", scalar(@plan), " sentences\n";
