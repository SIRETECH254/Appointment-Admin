import React from 'react';

interface NotesTabProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

const NotesTab: React.FC<NotesTabProps> = ({ notes, onNotesChange }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Additional Notes</h2>
      <p className="text-gray-500">Add any specific instructions or notes for the appointment.</p>

      <div className="md:col-span-2">
        <label className="label">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="input"
          rows={5}
          placeholder="e.g., specific requests, accessibility needs, etc."
        />
      </div>
    </div>
  );
};

export default NotesTab;
