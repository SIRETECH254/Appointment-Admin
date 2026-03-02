import React from 'react';
import type { ITimeSlot } from '../../../../types/api.types';
import { APPOINTMENT_TABS } from '../../../../constants/appointmentTabs'; // For tab IDs

interface SummaryTabProps {
  staff: any[];
  allServices: any[];
  selectedStaffId: string;
  selectedServices: string[];
  selectedDate: string;
  selectedSlot: ITimeSlot | null;
  notes: string;
  onEditTab: (tabId: string) => void;
}

const SummaryTab: React.FC<SummaryTabProps> = ({
  staff,
  allServices,
  selectedStaffId,
  selectedServices,
  selectedDate,
  selectedSlot,
  notes,
  onEditTab,
}) => {
  const selectedStaff = staff.find(s => s._id === selectedStaffId);
  const selectedServiceDetails = allServices.filter(service => selectedServices.includes(service._id));

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const SummarySection: React.FC<{ title: string; onEdit: () => void; icon: string; children: React.ReactNode; className?: string }> = ({
    title, onEdit, icon, children, className
  }) => (
    <div className={`rounded-lg p-4 shadow-sm relative ${className || 'bg-gray-50 border border-gray-200'}`}>
      <button onClick={onEdit} className="absolute top-3 right-3 text-gray-600 hover:text-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.827-2.828z" />
        </svg>
      </button>
      <div className="flex items-center space-x-3 mb-2">
        {/* Placeholder for icon */}
        <span className="text-xl">{icon}</span> 
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div className="space-y-1 text-gray-700">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Appointment Summary</h2>
      <p className="text-gray-500">Review your selections before creating the appointment.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Staff Section */}
        <SummarySection
          title="Staff"
          onEdit={() => onEditTab(APPOINTMENT_TABS[0].id)}
          icon="👤"
          className="bg-brand-primary/5 border border-brand-primary"
        >
          {selectedStaff ? (
            <div>
              <p className="font-medium">{selectedStaff.firstName} {selectedStaff.lastName}</p>
              {selectedStaff.roles && selectedStaff.roles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedStaff.roles.map((role: any) => (
                    <span key={role._id} className="badge-soft flex items-center gap-1">
                      {role.name === 'staff' && <span role="img" aria-label="staff">👨‍💼</span>}
                      {role.name === 'admin' && <span role="img" aria-label="admin">👑</span>}
                      {role.name === 'customer' && <span role="img" aria-label="customer">👤</span>}
                      {role.displayName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-500">No staff selected</p>
          )}
        </SummarySection>

        {/* Services Section */}
        <SummarySection 
          title="Services" 
          onEdit={() => onEditTab(APPOINTMENT_TABS[1].id)} 
          icon="🛠️"
          className="bg-gray-50 border border-gray-200" 
        >
          {selectedServiceDetails.length > 0 ? (
            <ul className="list-disc list-inside">
              {selectedServiceDetails.map(service => (
                <li key={service._id}>{service.name} ({service.duration} min)</li>
              ))}
            </ul>
          ) : (
            <p className="text-red-500">No services selected</p>
          )}
        </SummarySection>

        {/* Date & Time Section */}
        <SummarySection 
          title="Date & Time" 
          onEdit={() => onEditTab(APPOINTMENT_TABS[2].id)} 
          icon="📅"
          className="bg-gray-50 border border-gray-200" 
        >
          {selectedDate && selectedSlot ? (
            <>
              <p>{formatDate(selectedDate)}</p>
              <p>{formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}</p>
            </>
          ) : (
            <p className="text-red-500">No date or time selected</p>
          )}
        </SummarySection>

        {/* Notes Section */}
        <SummarySection 
          title="Notes" 
          onEdit={() => onEditTab(APPOINTMENT_TABS[3].id)} 
          icon="📝"
          className="bg-gray-50 border border-gray-200" 
        >
          {notes ? (
            <p className="whitespace-pre-wrap">{notes}</p>
          ) : (
            <p className="text-gray-500 italic">No notes provided</p>
          )}
        </SummarySection>
      </div>
    </div>
  );
};

export default SummaryTab;
