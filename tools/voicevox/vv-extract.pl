use utf8;
use open qw(:std :utf8);
use JSON::PP;
local $/;
sub rd { open my $f, '<', shift or die; my $s = <$f>; close $f; $s }
my @out;
my $os = rd('osatsu.js');
# 豆知識（MAME）と季節のあいさつ（SEASON）
my ($mame) = $os =~ /const MAME = \[(.*?)\n  \];/s or die 'mame';
push @out, map { ['m', $_] } $mame =~ /'([^']+)'/g;
my ($season) = $os =~ /const SEASON = \{(.*?)\};/s or die 'season';
push @out, map { ['m', $_] } $season =~ /:\s*'([^']+)'/g;
my $dk = rd('deck.js');
# 発表のお札マン（CL）：文字列そのもの、または { t: '...' }
my ($cl) = $dk =~ /const CL = \[(.*?)\n  \];/s or die 'cl';
for my $s ($cl =~ /(?:\{\s*t:\s*'([^']+)'|(?<![:\w])'([^'@][^']*)')/g) { next unless defined $s; next if $s =~ /^[.\[#]|^is-|nth-child|^(happy|wow|think|sad)$/; push @out, ['m', $s]; }
# ナレーション（S[i].n）
my ($sl) = $dk =~ /const S = \[(.*?)\n  \];/s or die 's';
push @out, map { ['n', $_] } $sl =~ /\bn:\s*'([^']+)'/g;
print JSON::PP->new->utf8(0)->canonical->encode(\@out);
