import { SectionLabel } from '@/components/brand';
export const metadata = { title: 'Your data on this site' };
export default function PrivacyPage() {
  return (
    <div className="page-width">
      <header className="page-hero">
        <SectionLabel>CLEAR BOUNDARIES</SectionLabel>
        <h1>
          Your voice.
          <br />
          <span className="serif-word">Your space.</span>
        </h1>
        <p>Here is what this version of the site does with microphone audio, text, and files.</p>
      </header>
      <article className="page-body prose">
        <h2>The lab and the generator</h2>
        <p>
          Microphone permission is requested only after you click Start listening. Audio is
          processed by the Phonlet Wake engine, in WebAssembly, in your browser. Nothing uploads,
          stores or records the stream. Stopping or leaving the page releases the microphone, the
          audio context and the worker.
        </p>
        <p>
          Phrases you type are calibrated by the threshold generator in your browser, too. They are
          not sent anywhere; the keyword file you download is made on your device.
        </p>
        <h2>Project brief</h2>
        <p>
          The contact form creates a local text file or copies a brief to your clipboard. It does
          not submit the form, send email, or save a mailing-list entry.
        </p>
        <h2>Appearance preferences</h2>
        <p>
          The site follows your device’s light or dark setting until you choose a theme. Your choice
          is saved in this browser so it can be restored on your next visit.
        </p>
        <h2>Site requests</h2>
        <p>
          This build contains no analytics, advertising, or tracking scripts. Hosting infrastructure
          can still receive ordinary page and asset requests. Connection details remain in memory
          for the current page session.
        </p>
      </article>
    </div>
  );
}
