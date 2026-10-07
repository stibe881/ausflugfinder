// Legal texts, taken unchanged from the former web app (ausflugfinder-web).
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
    sections: [
      {
        heading: "Verantwortliche Stelle",
        paragraphs: [
          "Verantwortlicher im Sinne der Datenschutzgesetze ist:",
          `AusflugFinder.ch\n${ADDRESS}\nE-Mail: stefan.gross@hotmail.ch`,
        ],
      },
      {
        heading: "Ihre Betroffenenrechte",
        paragraphs: ["Sie können jederzeit folgende Rechte ausüben:"],
        bullets: [
          "Auskunft über Ihre bei uns gespeicherten Daten und deren Verarbeitung.",
          "Berichtigung unrichtiger personenbezogener Daten.",
          "Löschung Ihrer bei uns gespeicherten Daten.",
          "Einschränkung der Datenverarbeitung, sofern wir Ihre Daten aufgrund gesetzlicher Pflichten noch nicht löschen dürfen.",
          "Widerspruch gegen die Verarbeitung Ihrer Daten bei uns.",
        ],
        footer:
          "Für Anfragen zu Ihren Rechten oder zum Datenschutz wenden Sie sich bitte an die oben angegebene E-Mail-Adresse.",
      },
      {
        heading: "Erfassung allgemeiner Informationen",
        paragraphs: [
          "Wenn Sie auf unsere Website zugreifen, werden automatisch mittels eines Cookies Informationen allgemeiner Natur erfasst. Diese Informationen (Server-Logfiles) beinhalten etwa die Art des Webbrowsers, das verwendete Betriebssystem, den Domainnamen Ihres Internet-Service-Providers und ähnliches.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "Unsere Website verwendet Cookies, um die Benutzerfreundlichkeit zu erhöhen. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. Einige der von uns verwendeten Cookies werden nach Ende der Browser-Sitzung wieder gelöscht (sog. Sitzungs-Cookies). Andere Cookies verbleiben auf Ihrem Endgerät und ermöglichen es uns, Ihren Browser beim nächsten Besuch wiederzuerkennen (persistente Cookies). Weitere Informationen zu den von uns verwendeten Cookies finden Sie in unserem Cookie-Banner.",
        ],
      },
      {
        heading: "Registrierung und Benutzerkonto",
        paragraphs: [
          "Bei der Registrierung für die Nutzung unserer personalisierten Leistungen werden einige personenbezogene Daten erhoben. Um Ihnen den vollen Funktionsumfang der App zu bieten, speichern wir folgende Daten: Name, E-Mail, Passwort (als Hash), sowie von Ihnen erstellte Inhalte wie Standortdaten, Reisepläne und Fotos. Diese Daten werden ausschließlich zur Bereitstellung der App-Funktionen verwendet.",
        ],
      },
      {
        heading: "Push-Benachrichtigungen",
        paragraphs: [
          "Wenn Sie zustimmen, können wir Ihnen Push-Benachrichtigungen senden, um Sie über wichtige Ereignisse oder Updates zu informieren. Sie können Ihre Zustimmung jederzeit in den Einstellungen Ihres Geräts widerrufen.",
        ],
      },
      {
        heading: "Verwendung von Google Maps",
        paragraphs: [
          "Diese Webseite verwendet Google Maps, um geographische Informationen visuell darzustellen. Bei der Nutzung von Google Maps werden von Google auch Daten über die Nutzung der Kartenfunktionen durch Besucher erhoben, verarbeitet und genutzt. Nähere Informationen über die Datenverarbeitung durch Google können Sie den Google-Datenschutzhinweisen entnehmen. Dort können Sie im Datenschutzcenter auch Ihre persönlichen Datenschutz-Einstellungen verändern.",
        ],
      },
      {
        heading: "Serverstandort",
        paragraphs: ["Ihre Daten werden auf Servern in der Schweiz gehostet."],
      },
      {
        heading: "Datenlöschung und -aufbewahrung",
        paragraphs: [
          "Wir speichern Ihre personenbezogenen Daten nur so lange, wie dies zur Erreichung der hier genannten Zwecke erforderlich ist oder wie es die vom Gesetzgeber vorgesehenen vielfältigen Speicherfristen vorsehen. Um die Löschung Ihrer Daten zu beantragen, senden Sie bitte eine E-Mail an stefan.gross@hotmail.ch.",
        ],
      },
      {
        heading: "Änderung unserer Datenschutzbestimmungen",
        paragraphs: [
          "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.",
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
          'Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten für alle Nutzer der Web-Applikation "AusflugFinder". Mit der Nutzung der Applikation erklären Sie sich mit diesen Bedingungen einverstanden.',
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
