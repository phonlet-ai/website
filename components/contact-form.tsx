'use client';
import { useRef, useState } from 'react';
import { Download, Copy, Check, Mail } from 'lucide-react';
export function ContactForm({ email }: { email?: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState('');
  const fields = () => {
    if (!form.current?.reportValidity()) return null;
    const d = new FormData(form.current);
    const get = (name: string) => String(d.get(name) ?? '').trim();
    return {
      name: get('name'),
      organization: get('organization'),
      interest: get('interest'),
      body: `Name: ${get('name')}\nOrganization: ${get('organization')}\nInterest: ${get('interest')}\nWake phrase: ${get('phrase')}\nPlatform: ${get('platform')}\n\nThe idea\n${get('idea')}\n`,
    };
  };
  const build = () => {
    const f = fields();
    return (
      f &&
      `PHONLET WAKE / PROJECT BRIEF\n\n${f.body}\nPrepared locally. This form has not sent any information.\n`
    );
  };
  const openMail = () => {
    const f = fields();
    if (!f || !email) return;
    const subject = `Phonlet Wake: ${f.interest} (${f.organization || f.name})`;
    const a = document.createElement('a');
    a.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(f.body)}`;
    a.click();
    setMessage(
      'Your email app should open with the brief filled in. Nothing is sent until you press Send there.',
    );
  };
  return (
    <form
      ref={form}
      className="contact-form"
      onSubmit={(e) => {
        e.preventDefault();
        const text = build();
        if (!text) return;
        const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'phonlet-project-brief.txt';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMessage(
          'Your brief is ready to save. Nothing has been submitted or sent. Share it through your preferred contact channel.',
        );
      }}
    >
      <div className="form-row">
        <label>
          Your name
          <input name="name" autoComplete="name" required maxLength={100} placeholder="Alex" />
        </label>
        <label>
          Organization <span className="muted">(optional)</span>
          <input
            name="organization"
            autoComplete="organization"
            maxLength={150}
            placeholder="Your team or project"
          />
        </label>
      </div>
      <label>
        What are you exploring?
        <select name="interest">
          <option>A commercial licence</option>
          <option>A custom wake word for my product</option>
          <option>Help with ESP32-S3 hardware</option>
          <option>Something else</option>
        </select>
      </label>
      <div className="form-row">
        <label>
          Wake phrase <span className="muted">(optional)</span>
          <input name="phrase" maxLength={100} placeholder="Hey Nova" />
        </label>
        <label>
          Platform
          <select name="platform">
            <option>Browser / web app</option>
            <option>Android or iOS app</option>
            <option>Linux / desktop</option>
            <option>ESP32-S3</option>
            <option>Other embedded</option>
          </select>
        </label>
      </div>
      <label>
        Tell us about the product
        <textarea
          name="idea"
          required
          minLength={20}
          maxLength={1500}
          placeholder="We’re building a… It runs on… We expect about … devices."
        />
      </label>
      <div className="hero-actions">
        {email && (
          <button type="button" className="button button-orange" onClick={openMail}>
            Open in email app <Mail size={15} />
          </button>
        )}
        <button type="submit" className={`button ${email ? 'button-outline' : 'button-orange'}`}>
          Save project brief <Download size={15} />
        </button>
        <button
          type="button"
          className="button button-outline"
          onClick={async () => {
            const text = build();
            if (!text) return;
            try {
              await navigator.clipboard.writeText(text);
              setMessage('Copied your brief. Nothing has been submitted or sent.');
            } catch {
              setMessage('Clipboard access is unavailable. Use Save project brief to download it.');
            }
          }}
        >
          <Copy size={14} />
          Copy
        </button>
      </div>
      <p className="form-note">
        {email ? (
          <>
            The brief opens in your own email app, addressed to{' '}
            <a href={`mailto:${email}`}>{email}</a>. This website does not submit your details or
            subscribe you to anything.
          </>
        ) : (
          'This form prepares a brief on your device. It does not submit your details, send an email, or subscribe you to anything.'
        )}
      </p>
      {message && (
        <div className="form-success" role="status">
          <Check size={14} style={{ display: 'inline', marginRight: 6 }} />
          {message}
        </div>
      )}
    </form>
  );
}
