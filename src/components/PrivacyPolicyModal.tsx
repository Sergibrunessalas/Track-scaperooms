import { useState } from 'react';
import { Shield } from 'lucide-react';

interface Props {
  onAccept: () => void;
  onDecline: () => void;
}

export default function PrivacyPolicyModal({ onAccept, onDecline }: Props) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        {/* Capçalera */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700 flex-shrink-0">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Shield size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Política de Privacitat</h2>
            <p className="text-gray-400 text-xs mt-0.5">Llegeix-la abans d'accedir a ScapeZone</p>
          </div>
        </div>

        {/* Contingut scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-5 text-gray-300 text-sm leading-relaxed space-y-5">

          <section>
            <h3 className="text-white font-bold text-base mb-2">1. Dades del responsable del tractament</h3>
            <h4 className="text-accent font-semibold mb-1">1.1. Normativa aplicable</h4>
            <p>La nostra Política de Privacitat s'ha dissenyat d'acord amb el <strong className="text-white">Reglament General de Protecció de Dades de la UE 2016/679 del Parlament Europeu i del Consell</strong>, de 27 d'abril de 2016, relatiu a la protecció de les persones físiques pel que fa al tractament de dades personals i a la lliure circulació d'aquestes dades i pel qual es deroga la Directiva 95/46/CE (Reglament general de protecció de dades), i la Llei orgànica 3/2018 del 5 de desembre, de Protecció de Dades de Caràcter Personal i Garantia dels Drets Digitals.</p>
            <p className="mt-2">En facilitar-nos les seves dades, Vostè declara haver llegit i conèixer la present Política de Privacitat, prestant el seu consentiment inequívoc i exprés al tractament de les seves dades personals d'acord amb les finalitats i termes aquí expressats.</p>
            <p className="mt-2">El responsable podrà modificar la present Política de Privacitat per a adaptar-la a les novetats legislatives, jurisprudencials o d'interpretació de l'Agència Espanyola de Protecció de Dades. Aquestes condicions de privacitat podran ser complementades per Política de Cookies i les Condicions Generals que, si escau, es recullin per a determinats productes o serveis, si aquest accés suposa alguna especialitat en matèria de protecció de dades de caràcter personal.</p>
          </section>

          <section>
            <h3 className="text-white font-bold text-base mb-2">2. Finalitat del tractament de dades personals</h3>
            <p>El tractament que realitzem de les seves dades personals respon a les següents finalitats:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Proporcionar-li informació relacionada als serveis i projectes que realitza ScapeZone que es detallen en aquest web site.</li>
              <li>Enviar-li per correu electrònic i/o postal les notícies i novetats sobre la nostra entitat, així com les actualitzacions dels nostres serveis i projectes.</li>
            </ul>
            <h4 className="text-accent font-semibold mt-3 mb-1">2.1. Termini de Conservació de les seves dades</h4>
            <p>Conservarem les seves dades personals des que ens doni el seu consentiment fins que el revoqui o bé sol·liciti la limitació del tractament. En tals casos, mantindrem les seves dades de manera bloquejada durant els terminis legalment exigits.</p>
          </section>

          <section>
            <h3 className="text-white font-bold text-base mb-2">3. Legítimació i dades recaptades</h3>
            <p>La legitimació per al tractament de les seves dades és el consentiment exprés atorgat mitjançant un acte positiu i afirmatiu (emplenar el formulari corresponent i marcar la casella d'acceptació d'aquesta política) en el moment de facilitar-nos les seves dades personals, així com el consentiment exprés sobre l'ús de cookies.</p>
            <h4 className="text-accent font-semibold mt-3 mb-1">3.1. Consentiment per tractar les teves dades</h4>
            <p>En emplenar els formularis, marcar la casella "Accepto la Política de Privacitat" i fer clic per a enviar les dades, o en remetre correus electrònics al Responsable a través dels comptes habilitats a aquest efecte, l'Usuari manifesta haver llegit i acceptat expressament la present política de privacitat, i atorga el seu consentiment inequívoc i exprés al tractament de les seves dades personals conforme a les finalitats indicades.</p>
            <h4 className="text-accent font-semibold mt-3 mb-1">3.2. Categories de dades</h4>
            <p>Les dades que es recapten es refereixen a la categoria de dades identificatives, com poden ser: Nom i Cognoms, Telèfon, Adreça Postal, Empresa, Correu electrònic, així com l'adreça IP des d'on accedeix al formulari de recollida de dades.</p>
          </section>

          <section>
            <h3 className="text-white font-bold text-base mb-2">4. Mesures de seguretat</h3>
            <p>Dins del nostre compromís per garantir la seguretat i confidencialitat de les seves dades de caràcter personal, l'informem que s'han adoptat les mesures d'índole tècnica i organitzatives necessàries per a garantir la seguretat de les dades de caràcter personal i evitar la seva alteració, pèrdua, tractament o accés no autoritzat, tenint en compte de l'estat de la tecnologia, la naturalesa de les dades emmagatzemades i els riscos al fet que estiguin exposats, segons l'Art. 32 del RGPD EU 679/2016.</p>
          </section>

          <section>
            <h3 className="text-white font-bold text-base mb-2">5. Cessió de dades</h3>
            <p>No es preveuen cessions de dades ni transferències internacionals de les seves dades, a excepció de les autoritzades per la legislació fiscal, mercantil i de telecomunicacions així com en aquells casos en els quals una autoritat judicial ens ho requereixi.</p>
          </section>

          <section>
            <h3 className="text-white font-bold text-base mb-2">6. Drets de l'usuari</h3>
            <p>Qualsevol interessat té dret a obtenir confirmació sobre si estem tractant dades personals que el concerneixin, o no. Les persones interessades tenen dret a accedir a les seves dades personals, així com a sol·licitar la rectificació de les dades inexactes o, en el seu cas, sol·licitar la seva supressió quan, entre altres motius, les dades ja no siguin necessàries per a les finalitats que van ser recollides. En determinades circumstàncies, els interessats podran sol·licitar la limitació del tractament de les seves dades, i en aquest cas únicament les conservarem per a l'exercici o la defensa de reclamacions. Per motius relacionats amb la seva situació particular, els interessats podran oposar-se al tractament de les seves dades. El Responsable del fitxer deixarà de tractar les dades, excepte per motius legítims imperiosos, o l'exercici o la defensa de possibles reclamacions.</p>
            <p className="mt-2">D'acord amb la legislació vigent té els següents drets: dret a sol·licitar l'accés a les seves dades personals, dret a sol·licitar la seva rectificació o supressió, dret a sol·licitar la limitació del seu tractament, dret a oposar-se al tractament, dret a la portabilitat de les dades i així mateix, a revocar el consentiment atorgat.</p>
            <h4 className="text-accent font-semibold mt-3 mb-1">6.1. Com exercitar els meus drets?</h4>
            <p>Per a exercir els seus drets, ha de dirigir-se al responsable, sol·licitant el corresponent formulari per a l'exercici del dret triat. Opcionalment, pot acudir a l'Autoritat de Control competent per a obtenir informació addicional sobre els seus drets. Pot exercir els seus drets en la següent adreça de correu electrònic: <a href="mailto:infoscpzone@gmail.com" className="text-accent hover:underline">infoscpzone@gmail.com</a>. Recordi acompanyar una còpia d'un document oficial que ens permeti identificar-lo.</p>
          </section>

          <section>
            <h3 className="text-white font-bold text-base mb-2">7. Consentiment per a l'enviament de comunicacions electròniques</h3>
            <p>Així mateix, i d'acord amb el que s'estableix en la Llei 34/2002, d'11 de juliol, de Serveis de la Societat de la Informació i del Comerç Electrònic, completant el formulari de recollida de dades i marcant la corresponent casella "Accepto l'enviament de comunicacions electròniques", està atorgant el consentiment exprés per a enviar-li a la seva adreça de correu electrònic, telèfon, fax o un altre mitjà electrònic l'enviament d'informació sobre el Responsable.</p>
          </section>

        </div>

        {/* Peu amb checkbox i botons */}
        <div className="px-6 py-4 border-t border-gray-700 flex-shrink-0 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-orange-500 cursor-pointer flex-shrink-0"
            />
            <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
              He llegit i accepto la <strong className="text-white">Política de Privacitat</strong> de ScapeZone
            </span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 text-sm font-medium transition-colors"
            >
              Cancel·lar
            </button>
            <button
              onClick={onAccept}
              disabled={!checked}
              className="flex-1 py-2.5 rounded-lg bg-accent text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-orange-500"
            >
              Acceptar i entrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
