'use client';

import { useState } from 'react';

export default function AddObjectForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function classifyImage(file: File) {
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];

      try {
        console.log('📤 Trimit imaginea la API...');
        const response = await fetch('/api/classify-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        const data = await response.json();
        console.log('📥 Răspuns AI:', data);

        if (data?.label) {
          setCategory(data.label);
        } else {
          alert('Nu s-a putut detecta categoria.');
        }
      } catch (err) {
        console.error('❌ Eroare la clasificare:', err);
        alert('Eroare la clasificare imagine.');
      }
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert(`Obiect adăugat: ${title}, ${description}, ${category}`);
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded max-w-md space-y-4 mx-auto">
      <h2 className="text-xl font-semibold">Adaugă un obiect nou</h2>

      <input
        type="text"
        placeholder="Titlu"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <textarea
        placeholder="Descriere"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            console.log("📁 Imagine selectată:", file.name);
            setImageFile(file);
            classifyImage(file);
          }
        }}
        className="w-full"
        required
      />

      <input
        type="text"
        placeholder="Categorie"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
        Salvează obiectul
      </button>
    </form>
  );
}
