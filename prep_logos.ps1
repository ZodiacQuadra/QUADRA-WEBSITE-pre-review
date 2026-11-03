# Prepare Quadra product logos for the local site (run once when logos change, then node build_live_copy.js):
# trims transparent margins, scales to 160px tall, writes site_src/logos/<slug>-on-light.png / -on-dark.png and
# manifest.json (sizes + measured lettering height). Usage: powershell -File prep_logos.ps1 -Project "<this folder>"
param([string]$Project)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System; using System.Drawing; using System.Drawing.Imaging; using System.Runtime.InteropServices;
public static class LogoTool {
  // bounding box of pixels with alpha above minAlpha, plus the alpha of the top-left corner
  public static int[] Bounds(Bitmap b, int minAlpha) {
    var d = b.LockBits(new Rectangle(0, 0, b.Width, b.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    int stride = d.Stride; byte[] px = new byte[stride * b.Height];
    Marshal.Copy(d.Scan0, px, 0, px.Length); b.UnlockBits(d);
    int x0 = b.Width, y0 = b.Height, x1 = -1, y1 = -1;
    for (int y = 0; y < b.Height; y++) for (int x = 0; x < b.Width; x++) {
      if (px[y * stride + x * 4 + 3] > minAlpha) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    return new int[] { x0, y0, x1, y1, px[3] };
  }
  static double Lum(byte[] p, int i) { return (0.2126 * p[i + 2] + 0.7152 * p[i + 1] + 0.0722 * p[i]) / 255.0; }
  // first empty column (cols) or row after `start`: the gap between a logo's mark and its wordmark
  public static int GapAfter(Bitmap b, bool cols, int start) {
    var d = b.LockBits(new Rectangle(0, 0, b.Width, b.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    int stride = d.Stride; byte[] px = new byte[stride * b.Height]; Marshal.Copy(d.Scan0, px, 0, px.Length); b.UnlockBits(d);
    int n = cols ? b.Width : b.Height, m = cols ? b.Height : b.Width;
    for (int i = start; i < n; i++) {
      bool empty = true;
      for (int j = 0; j < m && empty; j++) { int x = cols ? i : j, y = cols ? j : i; if (px[y * stride + x * 4 + 3] > 24) empty = false; }
      if (empty) return i;
    }
    return -1;
  }
  // height of the tallest run of non-empty rows inside a region: the lettering's line height in a wordmark
  public static int TallestBand(Bitmap b, Rectangle r) {
    var d = b.LockBits(new Rectangle(0, 0, b.Width, b.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    int stride = d.Stride; byte[] px = new byte[stride * b.Height]; Marshal.Copy(d.Scan0, px, 0, px.Length); b.UnlockBits(d);
    int best = 0, run = 0;
    for (int y = r.Top; y < r.Bottom; y++) {
      bool any = false;
      for (int x = r.Left; x < r.Right && !any; x++) if (px[y * stride + x * 4 + 3] > 60) any = true;
      run = any ? run + 1 : 0; if (run > best) best = run;
    }
    return best;
  }
  // average colour of solid pixels darker than maxLum inside a region
  public static int[] Average(Bitmap b, Rectangle r, double maxLum) {
    var d = b.LockBits(new Rectangle(0, 0, b.Width, b.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    int stride = d.Stride; byte[] px = new byte[stride * b.Height]; Marshal.Copy(d.Scan0, px, 0, px.Length); b.UnlockBits(d);
    long sr = 0, sg = 0, sb = 0, n = 0;
    for (int y = r.Top; y < r.Bottom; y++) for (int x = r.Left; x < r.Right; x++) { int i = y * stride + x * 4; if (px[i + 3] > 200 && Lum(px, i) < maxLum) { sr += px[i + 2]; sg += px[i + 1]; sb += px[i]; n++; } }
    return n == 0 ? new int[] { 0, 0, 0 } : new int[] { (int)(sr / n), (int)(sg / n), (int)(sb / n) };
  }
  // repaint pixels inside a region whose luminance is in [minLum, maxLum] (alpha kept, so edges stay smooth)
  public static void Repaint(Bitmap b, Rectangle r, double minLum, double maxLum, int cr, int cg, int cb) {
    var d = b.LockBits(new Rectangle(0, 0, b.Width, b.Height), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    int stride = d.Stride; byte[] px = new byte[stride * b.Height]; Marshal.Copy(d.Scan0, px, 0, px.Length);
    for (int y = r.Top; y < r.Bottom; y++) for (int x = r.Left; x < r.Right; x++) {
      int i = y * stride + x * 4; if (px[i + 3] == 0) continue; double l = Lum(px, i);
      if (l >= minLum && l <= maxLum) { px[i + 2] = (byte)cr; px[i + 1] = (byte)cg; px[i] = (byte)cb; }
    }
    Marshal.Copy(px, 0, d.Scan0, px.Length); b.UnlockBits(d);
  }
}
"@

$pics = "C:\Users\PrasanthS\Pictures\Quadra product logos\Quadra product logos"
$sources = [ordered]@{
  "intellient-on-light"            = "$pics\Intellient_Black_logo.png"
  "intellient-on-dark"             = "$pics\Intellient_White_logo.png"
  "intellilink-on-light"           = "$pics\Intellilink black logo.png"
  "intellilink-on-dark"            = "$pics\Intellilink White logo.png"
  "intellisphere-on-light"         = "$pics\IntelliSphere_logo.png"
  "intellisphere-on-dark"          = "$pics\IntelliSphere_logo white.png"
  "intelliassure-on-light"         = "$pics\IntelliAssure logo black.png"
  "intelliassure-on-dark"          = "$pics\IntelliAssure logo white.png"
  "quadra-air-on-light"            = "$pics\Logo_Quadra AIR-Black 1.png"
  "quadra-air-on-dark"             = "$pics\Logo_Quadra AIR-White 1.png"
  "bluforge-intelliguard-on-light" = "$pics\BluForge_intelliGaurd logo black.png"
  "intellixperience-on-light"      = "C:\Users\PrasanthS\Pictures\intelliXperience logo.png"
  "intellixperience-on-dark"       = "C:\Users\PrasanthS\Downloads\copilot poster\IntelliXperience-wordmark-dark-transparent.png"
  "bluforge-on-dark"               = "$Project\live_mirror\_mirror\framerusercontent.com\images\AMpY7ZKMXO9BV23RksHhgosQM.png"
}
$out = Join-Path $Project "site_src\logos"
New-Item -ItemType Directory -Force $out | Out-Null
$manifest = [ordered]@{}
$maxH = 160
foreach ($k in $sources.Keys) {
  $src = [System.Drawing.Bitmap]::FromFile($sources[$k])
  $bmp = New-Object System.Drawing.Bitmap $src.Width, $src.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp); $g.DrawImage($src, 0, 0, $src.Width, $src.Height); $g.Dispose()
  $b = [LogoTool]::Bounds($bmp, 24)
  $rect = [System.Drawing.Rectangle]::FromLTRB($b[0], $b[1], $b[2] + 1, $b[3] + 1)
  $scale = [Math]::Min(1.0, $maxH / $rect.Height)
  $w = [int][Math]::Round($rect.Width * $scale); $h = [int][Math]::Round($rect.Height * $scale)
  $dst = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($dst)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.DrawImage($bmp, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), $rect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $file = Join-Path $out ($k + ".png")
  $dst.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
  $manifest[$k] = [ordered]@{ w = $w; h = $h; cornerAlpha = $b[4]; source = (Split-Path $sources[$k] -Leaf); sourceSize = "$($src.Width)x$($src.Height)" }
  $src.Dispose(); $bmp.Dispose(); $dst.Dispose()
}
# The two logos with one version only get the other one by repainting the wordmark alone (the mark is untouched):
# BluForge IntelliGuard's navy "BluForge" turns white for dark backgrounds; the live BluForge logo's white wordmark
# turns that same navy for light backgrounds.
function Derive($from, $to, $note, [scriptblock]$paint) {
  $b = [System.Drawing.Bitmap]::FromFile((Join-Path $out "$from.png"))
  $bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp); $g.DrawImage($b, 0, 0, $b.Width, $b.Height); $g.Dispose(); $b.Dispose()
  & $paint $bmp
  $bmp.Save((Join-Path $out "$to.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $manifest[$to] = [ordered]@{ w = $bmp.Width; h = $bmp.Height; cornerAlpha = 0; source = "derived from $from.png"; sourceSize = $note }
  $bmp.Dispose()
}
$guard = [System.Drawing.Bitmap]::FromFile((Join-Path $out "bluforge-intelliguard-on-light.png"))
$textX = [LogoTool]::GapAfter($guard, $true, 10)
$navy = [LogoTool]::Average($guard, [System.Drawing.Rectangle]::new($textX, 0, $guard.Width - $textX, [int]($guard.Height * 0.45)), 0.33)
$guard.Dispose()
"IntelliGuard wordmark starts at x=$textX; BluForge navy = rgb($($navy -join ','))"
Derive "bluforge-intelliguard-on-light" "bluforge-intelliguard-on-dark" "navy wordmark repainted white" {
  param($bmp) [LogoTool]::Repaint($bmp, [System.Drawing.Rectangle]::new($textX, 0, $bmp.Width - $textX, $bmp.Height), 0.0, 0.33, 255, 255, 255)
}
Derive "bluforge-on-dark" "bluforge-on-light" "white wordmark repainted BluForge navy" {
  param($bmp)
  $y = [LogoTool]::GapAfter($bmp, $false, 10)
  "BluForge wordmark starts at y=$y"
  [LogoTool]::Repaint($bmp, [System.Drawing.Rectangle]::new(0, $y, $bmp.Width, $bmp.Height - $y), 0.6, 1.0, $navy[0], $navy[1], $navy[2])
}
# Lettering height of every logo (the wordmark beside or under the mark), so the site can size them to equal lettering
foreach ($k in @($manifest.Keys)) {
  $b = [System.Drawing.Bitmap]::FromFile((Join-Path $out "$k.png"))
  $bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp); $g.DrawImage($b, 0, 0, $b.Width, $b.Height); $g.Dispose(); $b.Dispose()
  if ($bmp.Width / $bmp.Height -lt 2) { $y = [LogoTool]::GapAfter($bmp, $false, 10); $region = [System.Drawing.Rectangle]::new(0, $y, $bmp.Width, $bmp.Height - $y) }
  else { $x = [LogoTool]::GapAfter($bmp, $true, 10); $region = [System.Drawing.Rectangle]::new($x, 0, $bmp.Width - $x, $bmp.Height) }
  $manifest[$k]["text"] = [LogoTool]::TallestBand($bmp, $region)
  $bmp.Dispose()
}
$manifest | ConvertTo-Json -Depth 3 | Out-File -Encoding utf8 (Join-Path $out "manifest.json")
$manifest.GetEnumerator() | ForEach-Object { "{0,-32} {1,4}x{2,-4} lettering {3,3}px  from {4} ({5})" -f $_.Key, $_.Value.w, $_.Value.h, $_.Value.text, $_.Value.source, $_.Value.sourceSize }
