param([string]$Titulo = "Quiosco UAEM", [string]$Cuerpo = "")

# Aviso emergente que aparece POR ENCIMA de la app en pantalla completa
# (esquina superior derecha) sin robar el foco. Se cierra solo a los ~9s.
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$src = @"
using System.Windows.Forms;
public class AvisoForm : Form {
  protected override bool ShowWithoutActivation { get { return true; } }
  protected override CreateParams CreateParams {
    get {
      CreateParams cp = base.CreateParams;
      cp.ExStyle |= 0x08000000; // WS_EX_NOACTIVATE
      cp.ExStyle |= 0x00000008; // WS_EX_TOPMOST
      return cp;
    }
  }
}
"@
Add-Type -TypeDefinition $src -ReferencedAssemblies System.Windows.Forms, System.Drawing

$f = New-Object AvisoForm
$f.FormBorderStyle = 'None'
$f.StartPosition   = 'Manual'
$f.TopMost         = $true
$f.ShowInTaskbar   = $false
$f.Width = 400; $f.Height = 108
$f.BackColor = [System.Drawing.Color]::FromArgb(0, 51, 102)
$wa = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
$f.Left = $wa.Right - $f.Width - 20
$f.Top  = $wa.Top + 20

$lt = New-Object System.Windows.Forms.Label
$lt.Text = $Titulo; $lt.ForeColor = 'White'; $lt.Dock = 'Top'; $lt.Height = 38
$lt.Font = New-Object System.Drawing.Font('Segoe UI', 12, [System.Drawing.FontStyle]::Bold)
$lt.Padding = New-Object System.Windows.Forms.Padding(14, 10, 14, 0)

$lc = New-Object System.Windows.Forms.Label
$lc.Text = $Cuerpo; $lc.ForeColor = 'White'; $lc.Dock = 'Fill'
$lc.Font = New-Object System.Drawing.Font('Segoe UI', 10)
$lc.Padding = New-Object System.Windows.Forms.Padding(14, 2, 14, 12)

$f.Controls.Add($lc); $f.Controls.Add($lt)

$f.Show()
$fin = (Get-Date).AddSeconds(9)
while ((Get-Date) -lt $fin -and -not $f.IsDisposed) {
  [System.Windows.Forms.Application]::DoEvents()
  Start-Sleep -Milliseconds 120
}
if (-not $f.IsDisposed) { $f.Close() }
