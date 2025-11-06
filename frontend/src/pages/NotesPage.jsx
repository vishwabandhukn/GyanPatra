import React, { useState, useRef } from 'react';
import { ArrowLeft, FileText, Save, Trash2, Plus } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const NotesPage = ({ onBack }) => {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Welcome Note',
      content: '<p>Welcome to MultiLang News Hub Notes!</p><p>You can create, edit, and download your notes here.</p>',
      createdAt: new Date().toISOString()
    }
  ]);
  const [selectedNote, setSelectedNote] = useState(notes[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const editorRef = useRef(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'link', 'blockquote', 'code-block'
  ];

  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: newNoteTitle || 'Untitled Note',
      content: '<p>Start writing your note...</p>',
      createdAt: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setNewNoteTitle('');
    setIsEditing(true);
  };

  const updateNote = (noteId, updates) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, ...updates } : note
    );
    setNotes(updatedNotes);
    setSelectedNote(updatedNotes.find(note => note.id === noteId));
  };

  const deleteNote = (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote(updatedNotes[0] || null);
    }
  };

  const downloadAsPDF = async () => {
    if (!selectedNote) return;
    const element = document.getElementById('note-content');
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, allowTaint: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${selectedNote.title}.pdf`);
  };

  const downloadAsTXT = () => {
    if (!selectedNote) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = selectedNote.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const blob = new Blob([textContent], { type: 'text/plain' });
    saveAs(blob, `${selectedNote.title}.txt`);
  };

  const downloadAsDOCX = async () => {
    if (!selectedNote) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = selectedNote.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: selectedNote.title, bold: true, size: 32 })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: textContent, size: 24 })
            ]
          })
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, `${selectedNote.title}.docx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Notes Editor
              </h1>
              <p className="text-sm text-gray-600">Create, edit, and download your notes</p>
            </div>
          </div>

          {/* Download Options */}
          {selectedNote && (
            <div className="flex items-center space-x-2">
              <button onClick={downloadAsPDF} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button onClick={downloadAsDOCX} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>DOCX</span>
              </button>
              <button onClick={downloadAsTXT} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>TXT</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Notes</h2>
            <button onClick={createNewNote} className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4">
            <input type="text" placeholder="New note title..." value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" onKeyPress={(e) => e.key === 'Enter' && createNewNote()} />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notes.map(note => (
              <div key={note.id} onClick={() => { setSelectedNote(note); setIsEditing(false); }} className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedNote?.id === note.id ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md' : 'hover:bg-gray-50 border-2 border-transparent'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl p-6 flex flex-col">
          {selectedNote ? (
            <>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex-1">
                  <input type="text" value={selectedNote.title} onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })} className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none w-full" />
                  <p className="text-sm text-gray-500 mt-1">Last modified: {new Date(selectedNote.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setIsEditing(!isEditing)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Save' : 'Edit'}</span>
                </button>
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <ReactQuill ref={editorRef} theme="snow" value={selectedNote.content} onChange={(content) => updateNote(selectedNote.id, { content })} modules={modules} formats={formats} style={{ height: '100%' }} />
                ) : (
                  <div id="note-content" className="prose max-w-none h-full overflow-y-auto p-4 border border-gray-200 rounded-lg" dangerouslySetInnerHTML={{ __html: selectedNote.content }} />
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Note Selected</h3>
                <p className="text-gray-600">Select a note from the sidebar or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
