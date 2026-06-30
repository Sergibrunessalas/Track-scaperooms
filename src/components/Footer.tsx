import { useState } from 'react';
import { Mail, X } from 'lucide-react';

function PrivacyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-white font-bold text-lg">Política de Privacitat</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 text-gray-300 text-sm leading-relaxed space-y-5">
          <section>
            <h3 className="text-white font-bold text-base mb-2">1. Dades del responsable del tractament</h3>
            <h4 className="text-orange-400 font-semibold mb-1">1.1. Normativa aplicable</h4>
            <p>La nostra Política de Privacitat s'ha dissenyat d'acord amb el <strong className="text-white">Reglament General de Protecció de Dades de la UE 2016/679 del Parlament Europeu i del Consell</strong>, de 27 d'abril de 2016, relatiu a la protecció de les persones físiques pel que fa al tractament de dades personals i a la lliure circulació d'aquestes dades i pel qual es deroga la Directiva 95/46/CE, i la Llei orgànica 3/2018 del 5 de desembre, de Protecció de Dades de Caràcter Personal i Garantia dels Drets Digitals.</p>
            <p className="mt-2">En facilitar-nos les seves dades, Vostè declara haver llegit i conèixer la present Política de Privacitat, prestant el seu consentiment inequívoc i exprés al tractament de les seves dades personals d'acord amb les finalitats i termes aquí expressats.</p>
          </section>

          <section>
            <h3 className="text-white font-bold text-base mb-2">2. Finalitat del tractament de dades personals</h3>
            <p>El tractament que realitzem de les seves dades personals respon a les següents finalitats:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Proporcionar-li informació relacionada als serveis i projectes que realitza ScapeZone.</li>
              <li>Enviar-li per correu electrònic les notícies i novetats sobre la nostra entitat, així com les actualitzacions dels nostres serveis i projectes.</li>
            </ul>
            <h4 className="text-orange-400 font-semibold mt-3 mb-1">2.1. Termini de Conservació de les seves dades</h4>
            <p>Conservarem les seves dades personals des que ens doni el seu consentiment fins que el revoqui o bé sol·liciti la limitació del tractament.</p>
          </section>

          <section>
            <h3 className="text-white font-bold text-base mb-2">3. Legítimació i dades recaptades</h3>
            <p>La legitimació per al tractament de les seves dades és el consentiment exprés atorgat mitjançant un acte positiu i afirmatiu en el moment de facilitar-nos les seves dades personals.</p>
            <h4 className="text-orange-400 font-semibold mt-3 mb-1">3.1. Consentiment per tractar les teves dades</h4>
            <p>En emplenar els formularis i marcar la casella "Accepto la Política de Privacitat", l'Usuari manifesta haver llegit i acceptat expressament la present política de privacitat.</p>
            <h4 className="text-orange-400 font-semibold mt-3 mb-1">3.2. Categories de dades</h4>
            <p>Les dades que es recapten es refereixen a la categoria de dades identificatives: Nom i Cognoms, Telèfon, Adreça Postal, Empresa, Correu electrònic, així com l'adreça IP.</p>
          </section>

          <section>
            <h3 className="text-white font-bold text-base mb-2">4. Mesures de seguretat</h3>
            <p>S'han adoptat les mesures d'índole tècnica i organitzatives necessàries per a garantir la seguretat de les dades de caràcter personal i evitar la seva alteració, pèrdua, tractament o accés no autoritzat, segons l'Art. 32 del RGPD EU 679/2016.</p>
          </section>

          <section>
            <h3 className="text-white font-bold text-base mb-2">5. Cessió de dades</h3>
            <p>No es preveuen cessions de dades ni transferències internacionals de les seves dades, a excepció de les autoritzades per la legislació fiscal, mercantil i de telecomunicacions.</p>
          </section>

          <section>
            <h3 className="text-white font-bold text-base mb-2">6. Drets de l'usuari</h3>
            <p>Qualsevol interessat té dret a obtenir confirmació sobre si estem tractant dades personals que el concerneixin. Les persones interessades tenen dret a accedir a les seves dades personals, sol·licitar la rectificació de les dades inexactes o sol·licitar la seva supressió.</p>
            <h4 className="text-orange-400 font-semibold mt-3 mb-1">6.1. Com exercitar els meus drets?</h4>
            <p>Pot exercir els seus drets en la següent adreça de correu electrònic: <a href="mailto:info.scpzone@gmail.com" className="text-orange-400 hover:underline">info.scpzone@gmail.com</a>.</p>
          </section>

          <section>
            <h3 className="text-white font-bold text-base mb-2">7. Consentiment per a l'enviament de comunicacions electròniques</h3>
            <p>D'acord amb el que s'estableix en la Llei 34/2002, d'11 de juliol, de Serveis de la Societat de la Informació i del Comerç Electrònic, en completar el formulari i marcar la casella corresponent, l'usuari atorga el consentiment exprés per a l'enviament de comunicacions electròniques.</p>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors"
          >
            Tancar
          </button>
        </div>
      </div>
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.6 2.8 12 2.8 12 2.8s-4.6 0-6.8.1C4.6 3 3.3 3 2.2 4.2 1.3 5 1 7 1 7S.7 9.3.7 11.5v2.1C.7 15.8 1 18 1 18s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.6 22.2 12 22.2 12 22.2s4.6 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.3.3-4.5v-2.1C23.3 9.3 23 7 23 7zM9.7 15.5V8.4l8 3.6-8 3.5z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <footer className="bg-gray-900 border-t border-gray-700 mt-auto flex-shrink-0">
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

      <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-xs font-black tracking-[0.2em] uppercase text-orange-500 mb-3">
            MÉS QUE SCAPEZONE
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-gray-300 mb-4">
            <a
              href="mailto:info.scpzone@gmail.com"
              className="hover:text-orange-400 transition-colors"
            >
              info.scpzone@gmail.com
            </a>
            <span className="text-gray-400">609 939 779</span>
          </div>

          {/* Icones socials */}
          <div className="flex items-center justify-center gap-3">
            {/* Instagram — actiu */}
            <a
              href="https://www.instagram.com/scapezonegamers/"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram @scapezonegamers"
              className="text-gray-400 hover:text-orange-500 transition-colors"
            >
              <InstagramIcon />
            </a>

            {/* Correu — actiu */}
            <a
              href="mailto:info.scpzone@gmail.com"
              title="Envia'ns un correu"
              className="text-gray-400 hover:text-orange-500 transition-colors"
            >
              <Mail size={18} />
            </a>

            {/* Twitter/X — pendent d'activar */}
            <span title="Twitter/X (pròximament)" className="text-gray-600 cursor-default">
              <TwitterIcon />
            </span>

            {/* YouTube — pendent d'activar */}
            <span title="YouTube (pròximament)" className="text-gray-600 cursor-default">
              <YouTubeIcon />
            </span>

            {/* Facebook — pendent d'activar */}
            <span title="Facebook (pròximament)" className="text-gray-600 cursor-default">
              <FacebookIcon />
            </span>
          </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-gray-800 py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 text-xs text-gray-500">
          <button
            onClick={() => setShowPrivacy(true)}
            className="hover:text-orange-400 transition-colors"
          >
            Política de Privacitat
          </button>
          <span className="hidden sm:inline">·</span>
          <span>Copyright © 2026 ScapeZone · Tots els drets reservats.</span>
        </div>
      </div>
    </footer>
  );
}
