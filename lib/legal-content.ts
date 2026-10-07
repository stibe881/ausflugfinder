// Legal texts. Impressum and AGB come from the former web app; the privacy
// policy was rewritten to match what the app actually does.
// German only, as before.

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  footer?: string;
};

export type LegalDocument = {
  title: string;
  sections: LegalSection[];
  updated?: string;
};

export type LegalDocumentKey = "impressum" | "privacy" | "terms";

const ADDRESS = ["Stefan Gross", "Neuhushof 3", "CH-6411 Zell LU"].join("\n");

export const LEGAL_DOCUMENTS: Record<LegalDocumentKey, LegalDocument> = {
  impressum: {
    title: "Impressum",
    sections: [
      { heading: "Angaben gemäß § 5 TMG", paragraphs: [ADDRESS] },
      {
        heading: "Kontakt",
        paragraphs: ["Telefon: +41 79 414 06 16\nE-Mail: stefan.gross@hotmail.ch"],
      },
      {
        heading: "Haftungsausschluss",
        paragraphs: [
          "Inhaltlich verantwortlich: Stefan Gross (Anschrift wie oben)",
          "Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.",
        ],
      },
    ],
  },

  privacy: {
    title: "Datenschutzerklärung",
    updated: "Stand: Oktober 2026",
    sections: [
      {
        heading: "Verantwortliche Stelle",
        paragraphs: [
          "Verantwortlicher im Sinne der Datenschutzgesetze ist:",
          `AusflugFinder.ch\n${ADDRESS}\nE-Mail: stefan.gross@hotmail.ch`,
          "Diese Erklärung gilt für die AusflugFinder-App (iOS und Android) und für die Web-Version.",
        ],
      },
      {
        heading: "Welche Daten wir verarbeiten",
        paragraphs: ["Wir verarbeiten nur Daten, die für die Funktionen der App nötig sind:"],
        bullets: [
          "Kontodaten: Name, E-Mail-Adresse und Passwort. Das Passwort wird nur als Hash gespeichert, nicht im Klartext.",
          "Inhalte, die Sie erstellen: Favoriten, gemerkte und erledigte Ausflüge, Pläne mit Packliste, Budget und Teilnehmern, Freundeslisten und Einladungen sowie Fotos.",
          "Gutscheine: Wenn Sie ein Konto der Gutschein-App verknüpfen, werden Ihre E-Mail-Adresse und die Gutscheindaten mit dem jeweiligen Ausflug verbunden.",
          "Push-Token Ihres Geräts, damit wir Benachrichtigungen zustellen können.",
          "Standortdaten, nur wenn Sie den Zugriff erlauben (siehe unten).",
        ],
      },
      {
        heading: "Registrierung und Benutzerkonto",
        paragraphs: [
          "Für personalisierte Funktionen ist ein Konto nötig. Die Anmeldung und die Speicherung Ihrer Daten laufen über Supabase. Sie können Ihr Konto jederzeit in der App unter Profil löschen. Dabei werden Ihr Konto und Ihre zugehörigen Daten entfernt.",
        ],
      },
      {
        heading: "Standort",
        paragraphs: [
          "Mit Ihrer Erlaubnis nutzt die App Ihren Standort, um Ausflugsziele in Ihrer Nähe und Entfernungen anzuzeigen. Wenn Sie die Funktion aktivieren, nutzt die App den Standort auch im Hintergrund, um Sie auf Ausflugsziele in der Nähe hinzuweisen. Sie können die Erlaubnis jederzeit in den Einstellungen Ihres Geräts oder in der App widerrufen.",
          "Für Karten, Entfernungen und Wetter übermitteln wir Koordinaten oder Adressen an die unten genannten Dienstleister.",
        ],
      },
      {
        heading: "Push-Benachrichtigungen",
        paragraphs: [
          "Wenn Sie zustimmen, senden wir Ihnen Benachrichtigungen, zum Beispiel zu neuen Ausflügen oder Freundschaftsanfragen. Die Zustellung erfolgt über den Push-Dienst von Expo sowie über Apple beziehungsweise Google. Sie können Ihre Zustimmung jederzeit in den Einstellungen Ihres Geräts widerrufen.",
        ],
      },
      {
        heading: "Anmeldung mit Face ID oder Touch ID",
        paragraphs: [
          "Die biometrische Anmeldung wird von Ihrem Gerät geprüft. Biometrische Daten verlassen Ihr Gerät nicht und werden von uns nicht gespeichert.",
        ],
      },
      {
        heading: "Dienstleister und Datenempfänger",
        paragraphs: ["Wir setzen folgende Dienstleister ein:"],
        bullets: [
          "Supabase: Anmeldung, Datenbank, Dateispeicher und Serverfunktionen. Die Daten werden in der AWS-Region Europa (London, Vereinigtes Königreich) gespeichert.",
          "Google Maps: Kartendarstellung, Adresssuche und Entfernungsberechnung. Dabei erhält Google unter anderem Ihre IP-Adresse sowie Koordinaten oder Adressen. Es gelten die Datenschutzhinweise von Google.",
          "OpenWeather: Wetterdaten. Dabei werden Koordinaten übermittelt.",
          "Expo: Zustellung von Push-Benachrichtigungen.",
          "Resend: Versand von E-Mails, zum Beispiel bei Einladungen an Freunde.",
        ],
        footer:
          "Einige dieser Dienstleister haben ihren Sitz oder ihre Server ausserhalb der Schweiz, zum Beispiel in den USA oder im Vereinigten Königreich.",
      },
      {
        heading: "Web-Version",
        paragraphs: [
          "In der Web-Version wird Ihre Anmeldung im lokalen Speicher Ihres Browsers abgelegt, damit Sie angemeldet bleiben. Wir setzen keine Tracking-Cookies ein. Beim Aufruf der Webseite verarbeitet der Server technisch bedingt kurzzeitig Angaben wie die IP-Adresse, den Browsertyp und das Betriebssystem.",
        ],
      },
      {
        heading: "Keine Analyse und keine Werbung",
        paragraphs: [
          "Wir setzen keine Analyse-, Tracking- oder Werbe-Dienste ein und verkaufen keine Daten.",
        ],
      },
      {
        heading: "Ihre Betroffenenrechte",
        paragraphs: ["Sie können jederzeit folgende Rechte ausüben:"],
        bullets: [
          "Auskunft über Ihre bei uns gespeicherten Daten und deren Verarbeitung.",
          "Berichtigung unrichtiger personenbezogener Daten.",
          "Löschung Ihrer bei uns gespeicherten Daten, in der App unter Profil oder per E-Mail.",
          "Einschränkung der Datenverarbeitung, sofern wir Ihre Daten aufgrund gesetzlicher Pflichten noch nicht löschen dürfen.",
          "Widerspruch gegen die Verarbeitung Ihrer Daten bei uns.",
        ],
        footer:
          "Für Anfragen zu Ihren Rechten oder zum Datenschutz wenden Sie sich bitte an die oben angegebene E-Mail-Adresse.",
      },
      {
        heading: "Datenlöschung und -aufbewahrung",
        paragraphs: [
          "Wir speichern Ihre personenbezogenen Daten nur so lange, wie dies für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen es verlangen. Um die Löschung Ihrer Daten zu beantragen, löschen Sie Ihr Konto in der App oder senden Sie eine E-Mail an stefan.gross@hotmail.ch.",
        ],
      },
      {
        heading: "Änderung dieser Datenschutzerklärung",
        paragraphs: [
          "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen abzubilden. Es gilt die jeweils aktuelle Fassung.",
        ],
      },
    ],
  },

  terms: {
    title: "Allgemeine Geschäftsbedingungen (AGB)",
    updated: "Stand: 22. November 2025",
    sections: [
      {
        heading: "1. Geltungsbereich",
        paragraphs: [
          'Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten für alle Nutzer der App und Web-Applikation "AusflugFinder". Mit der Nutzung der Applikation erklären Sie sich mit diesen Bedingungen einverstanden.',
        ],
      },
      {
        heading: "2. Leistungen",
        paragraphs: [
          "AusflugFinder bietet eine Plattform zur Entdeckung, Planung und Verwaltung von Familienausflügen. Die Nutzung der Grundfunktionen ist kostenlos. Zukünftige Premium-Funktionen können kostenpflichtig sein.",
        ],
      },
      {
        heading: "3. Registrierung und Nutzerkonto",
        paragraphs: [
          "Für die Nutzung bestimmter Funktionen ist eine Registrierung erforderlich. Sie sind verpflichtet, bei der Registrierung wahrheitsgemässe Angaben zu machen. Sie sind für die Sicherheit Ihres Passworts selbst verantwortlich.",
        ],
      },
      {
        heading: "4. Nutzerinhalte",
        paragraphs: [
          "Sie sind für alle Inhalte (wie z.B. Ausflugsdetails, Fotos, Kommentare), die Sie auf der Plattform veröffentlichen, selbst verantwortlich. Sie gewähren AusflugFinder eine nicht-exklusive, weltweite Lizenz zur Nutzung, Anzeige und Verbreitung Ihrer öffentlichen Inhalte im Rahmen des Betriebs der Plattform. Sie dürfen keine Inhalte hochladen, die gegen geltendes Recht oder die Rechte Dritter verstossen.",
        ],
      },
      {
        heading: "5. Datenschutz",
        paragraphs: [
          "Der Schutz Ihrer Daten ist uns wichtig. Unsere Datenschutzpraktiken sind in unserer separaten Datenschutzerklärung detailliert beschrieben.",
        ],
      },
      {
        heading: "6. Haftungsausschluss",
        paragraphs: [
          "AusflugFinder übernimmt keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der von Nutzern bereitgestellten Informationen. Die Nutzung der auf der Plattform vorgeschlagenen Ausflüge und Aktivitäten erfolgt auf eigene Gefahr. AusflugFinder haftet nicht für Schäden, die im Zusammenhang mit der Durchführung eines Ausflugs entstehen.",
        ],
      },
      {
        heading: "7. Änderungen der AGB",
        paragraphs: [
          "AusflugFinder behält sich das Recht vor, diese AGB jederzeit zu ändern. Über wesentliche Änderungen werden die Nutzer in geeigneter Form informiert. Wenn Sie die Plattform nach einer Änderung weiter nutzen, gilt dies als Ihre Zustimmung zu den geänderten AGB.",
        ],
      },
      {
        heading: "8. Schlussbestimmungen",
        paragraphs: [
          "Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Gültigkeit der übrigen Bestimmungen unberührt. Es gilt schweizerisches Recht. Gerichtsstand ist der Sitz von AusflugFinder.",
        ],
      },
    ],
  },
};
