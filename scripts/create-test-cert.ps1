# This script creates a self-signed certificate for local MSIX signing.
# The Publisher name MUST match the one in your AppxManifest.xml exactly.

$publisherName = "CN=2077DAC8-096F-4B93-861E-82E55C3D1D51"
$outCert = "packaging\windows\DogeMinerCE_Test.pfx"
$password = ConvertTo-SecureString "dogeminer" -AsPlainText -Force

if (Test-Path $outCert) {
    Write-Host "Certificate already exists at $outCert. Skipping creation."
    exit 0
}

Write-Host "Creating self-signed certificate for $publisherName..."
$cert = New-SelfSignedCertificate -Type Custom -Subject $publisherName `
    -KeyUsage DigitalSignature -FriendlyName "DogeMinerCE Test Cert" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")

Export-PfxCertificate -Cert $cert -FilePath $outCert -Password $password

Write-Host "--------------------------------------------------------"
Write-Host "Successfully created $outCert"
Write-Host "Password: dogeminer"
Write-Host "--------------------------------------------------------"
Write-Host "IMPORTANT: To install and test the MSIX on your machine,"
Write-Host "you must double-click the .pfx, install it to 'Local Machine',"
Write-Host "and choose the 'Trusted People' store."
Write-Host "--------------------------------------------------------"
