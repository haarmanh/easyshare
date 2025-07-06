# EasyShare - Browser Extension

Een moderne browser extensie voor het snel delen van bestanden en mappen via Supabase Storage.

## ✨ Features

- **Supabase Storage**: Moderne, betrouwbare cloud opslag met signed URLs
- **Folder Support**: Automatische ZIP compressie voor mappen
- **Zero-friction workflow**: Sleep & drop bestanden of mappen
- **Automatisch clipboard**: Download links worden automatisch gekopieerd
- **Upload geschiedenis**: Houd bij wat je hebt geüpload
- **Platform-specifieke sharing**: Directe integratie met email, messaging apps
- **Progress tracking**: Real-time upload en compressie voortgang
- **JSZip Integration**: Automatische map compressie naar ZIP bestanden

## 🚀 Installatie

### 1. Vercel Backend Setup (Required)
1. **Deploy naar Vercel:**
   - Fork deze repository
   - Verbind met Vercel via GitHub
   - Stel environment variables in via Vercel dashboard

2. **Environment Variables in Vercel:**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_BUCKET_NAME=uploads
   VERCEL_URL=your-app.vercel.app
   ```

3. **Build de extensie:**
   ```bash
   npm run build
   ```

📖 **Zie [ARCHITECTURE.md](ARCHITECTURE.md) voor de complete client-server architectuur**
📖 **Zie [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) voor deployment instructies**

### 2. Browser Extension Installatie
1. Download de extensie bestanden
2. Open Chrome en ga naar `chrome://extensions/`
3. Schakel "Developer mode" in (rechtsboven)
4. Klik "Load unpacked" en selecteer de `dist` folder
5. De EasyShare extensie is nu geïnstalleerd!

## ⚙️ Supabase Setup

### 1. Supabase Project aanmaken

1. **Account aanmaken:**
   - Ga naar [Supabase](https://supabase.com/)
   - Maak een gratis account aan
   - Klik "New Project"

2. **Project configureren:**
   - Kies een project naam
   - Stel een database wachtwoord in
   - Selecteer een regio (bij voorkeur dichtbij je gebruikers)
   - Klik "Create new project"

### 2. Storage Bucket aanmaken

1. **Ga naar Storage:**
   - In je Supabase dashboard, klik "Storage" in het zijmenu
   - Klik "Create a new bucket"

2. **Bucket configureren:**
   - Naam: `uploads` (of een andere naam naar keuze)
   - Maak de bucket **Public** voor eenvoudige toegang
   - Klik "Create bucket"

### 3. RLS Policies instellen

1. **Ga naar Policies:**
   - Klik op je bucket → "Policies" tab
   - Klik "New Policy"

2. **Upload Policy:**
   ```sql
   -- Allow anyone to upload files
   CREATE POLICY "Allow public uploads" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'uploads');
   ```

3. **Download Policy:**
   ```sql
   -- Allow anyone to download files
   CREATE POLICY "Allow public downloads" ON storage.objects
   FOR SELECT USING (bucket_id = 'uploads');
   ```

### 4. API Keys ophalen

1. **Ga naar Settings:**
   - Klik "Settings" → "API" in het zijmenu

2. **Kopieer de volgende waarden:**
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: De `anon` `public` key

### 5. EasyShare configureren

1. **Open EasyShare:**
   - Klik op de EasyShare extensie
   - Klik op het tandwiel (⚙️) voor instellingen

2. **Voer Supabase gegevens in:**
   - **Project URL**: Plak je Supabase project URL
   - **Anon Key**: Plak je anon key
   - **Bucket Name**: `uploads` (of je gekozen naam)
   - **Link Expiration**: 3600 seconden (1 uur) standaard

3. **Klik "Save Supabase Config"**

## 📱 Gebruik

### Bestanden uploaden
1. Klik op de EasyShare extensie
2. Klik "Choose File" of sleep een bestand naar het upload gebied
3. Upload start automatisch
4. Download link wordt gekopieerd naar clipboard

### Mappen uploaden
1. Klik op de EasyShare extensie
2. Klik "Choose Folder" of sleep een map naar het upload gebied
3. Map wordt automatisch gecomprimeerd naar ZIP
4. ZIP bestand wordt geüpload naar Supabase
5. Download link wordt gekopieerd naar clipboard

### Link delen
- Link wordt automatisch gekopieerd naar clipboard
- Klik op platform-specifieke share buttons
- Of gebruik de universele share optie

## 🔧 Technische Details

### Ondersteunde Features
- **Bestanden**: Tot 50MB per bestand
- **Mappen**: Automatische ZIP compressie
- **Signed URLs**: Tijdelijke download links (configureerbaar)
- **Progress tracking**: Real-time voortgang voor upload en compressie

### Browser Compatibiliteit
- Chrome/Chromium browsers
- Manifest V3 compatible
- Moderne JavaScript features

### Dependencies
- Supabase JavaScript Client v2.39.0
- JSZip v3.10.1
- Geen externe build tools vereist

## 🛠️ Development

```bash
# Clone repository
git clone <repository-url>
cd easyshare

# Install dependencies
npm install

# Build extensie
npm run build

# Output in dist/ folder
```

## 📋 Troubleshooting

### Supabase Errors
- **"Unauthorized"**: Check je RLS policies en API key
- **"Bucket not found"**: Controleer bucket naam in configuratie
- **"Invalid URL"**: Zorg dat je project URL correct is

### Upload Problemen
- **"File too large"**: Bestanden groter dan 50MB worden niet ondersteund
- **"Compression failed"**: JSZip library mogelijk niet geladen
- **"No signed URL"**: Check bucket policies voor downloads

### Algemene Problemen
- **Extensie laadt niet**: Herlaad in chrome://extensions/
- **Geen progress**: Check browser console voor errors
- **Configuratie niet opgeslagen**: Controleer alle vereiste velden

## 🔒 Privacy & Beveiliging

- Bestanden worden geüpload naar jouw eigen Supabase project
- Signed URLs hebben configureerbare vervaltijd
- Geen tracking of analytics
- Upload geschiedenis is optioneel en lokaal

## 📄 Licentie

MIT License - zie LICENSE bestand voor details.

## 🤝 Bijdragen

Pull requests zijn welkom! Voor grote wijzigingen, open eerst een issue om te bespreken wat je wilt veranderen.

## 📞 Support

Voor vragen of problemen, open een issue in de GitHub repository.
