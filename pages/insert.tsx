import { useEffect } from 'react';

export default function InsertRedirect() {
  useEffect(() => { window.location.replace('/add-object'); }, []);
  return <div className="card">Redirect către <a href="/add-object">/add-object</a>…</div>;
}
