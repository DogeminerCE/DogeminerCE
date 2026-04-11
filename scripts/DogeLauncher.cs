using System;
using System.Drawing;
using System.Windows.Forms;
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;
using System.IO;

namespace DogeMinerCE
{
    /* 
     * Minimal WebView2 Launcher for DogeminerCE
     * This ensures the game runs using the modern Chromium engine
     * instead of the Legacy Edge engine used by default in MSIX.
     */
    public class DogeLauncher : Form
    {
        private WebView2 webView;

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new DogeLauncher());
        }

        public DogeLauncher()
        {
            this.Text = "Dogeminer: Community Edition";
            this.Size = new Size(1280, 800);
            this.StartPosition = FormStartPosition.CenterScreen;
            
            // Try to set icon from the executable itself
            try { this.Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch {}

            webView = new WebView2();
            webView.Dock = DockStyle.Fill;
            this.Controls.Add(webView);

            this.Load += DogeLauncher_Load;
        }

        private async void DogeLauncher_Load(object sender, EventArgs e)
        {
            try
            {
                // Set the cache/user data folder inside the app's local storage to avoid permission issues
                string userDataFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "DogeMinerCE_Cache");
                
                // Initialize the environment (using the default browser channel)
                var env = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
                
                await webView.EnsureCoreWebView2Async(env);

                // Navigation: Load the local game file
                string appPath = AppDomain.CurrentDomain.BaseDirectory;
                string indexPath = Path.Combine(appPath, "play", "index.html");

                if (File.Exists(indexPath))
                {
                    // Use file:// scheme for local files in WebView2
                    webView.Source = new Uri(indexPath);
                }
                else
                {
                    MessageBox.Show("Fatal Error: Could not find game files at: " + indexPath, "DogeMinerCE Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Failed to initialize modern Chromium engine (WebView2).\n\nDetails: " + ex.Message + "\n\nPlease ensure the 'WebView2 Runtime' is installed on your system.", "DogeMinerCE Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
