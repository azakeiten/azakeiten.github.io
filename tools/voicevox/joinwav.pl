# joinwav.pl 出力.wav 間の秒数 入力1.wav 入力2.wav ...
# 同じ形式（VOICEVOX の 16bit・モノラル）の wav を、前後の無音を切って、決まった間をあけてつなぐ（開演のカウントダウン 3・2・1・0 用）
use strict;
my ($out, $gap, @in) = @ARGV;
my ($fmt, $rate, $pcm) = (undef, 24000, '');
for my $i (0 .. $#in) {
  open my $f, '<:raw', $in[$i] or die $in[$i]; local $/; my $b = <$f>; close $f;
  my $p = 12; my ($data);
  while ($p < length $b) { my ($id, $len) = unpack('a4 V', substr($b, $p, 8)); if ($id eq 'fmt ') { $fmt = substr($b, $p + 8, $len); $rate = unpack('V', substr($fmt, 4, 4)); } elsif ($id eq 'data') { $data = substr($b, $p + 8, $len); } $p += 8 + $len + ($len & 1); }
  my @s = unpack('s<*', $data);
  my ($a, $z) = (0, $#s); $a++ while $a < $z && abs($s[$a]) < 400; $z-- while $z > $a && abs($s[$z]) < 400;
  $a = $a > 240 ? $a - 240 : 0; $z = $z + 1200 < $#s ? $z + 1200 : $#s;
  $pcm .= pack('s<*', @s[$a .. $z]);
  $pcm .= pack('s<*', (0) x int($rate * $gap)) if $i < $#in;
}
open my $o, '>:raw', $out or die;
print $o 'RIFF', pack('V', 4 + 8 + length($fmt) + 8 + length $pcm), 'WAVE', 'fmt ', pack('V', length $fmt), $fmt, 'data', pack('V', length $pcm), $pcm;
close $o;
