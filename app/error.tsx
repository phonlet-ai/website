'use client';
import { ArrowRight } from 'lucide-react';
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page-width not-found">
      <span className="mono muted">LET’S RECONNECT</span>
      <h1>A brief interruption.</h1>
      <p>This page couldn’t finish loading. You can try again below.</p>
      <button className="button button-orange" onClick={reset}>
        Try again <ArrowRight size={16} />
      </button>
    </div>
  );
}
