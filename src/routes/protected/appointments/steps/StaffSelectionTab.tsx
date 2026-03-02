import React from 'react';

interface StaffSelectionTabProps {
  staff: any[];
  selectedStaffId: string;
  onStaffChange: (staffId: string) => void;
  selectedDate: string; // Add selectedDate prop
}

const StaffSelectionTab: React.FC<StaffSelectionTabProps> = ({ staff, selectedStaffId, onStaffChange, selectedDate }) => {

  const getWorkingHoursForDate = (staffMember: any, dateString: string) => {
    if (!dateString || !staffMember.workingHours) return 'Not available';

    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase(); // e.g., 'monday'

    const hours = staffMember.workingHours[dayOfWeek];

    if (hours && hours.length > 0) {
      return hours.map((slot: any) => `${slot.start} - ${slot.end}`).join(', ');
    }
    return 'Not working';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Select Staff</h2>
      <p className="text-gray-500">Choose a staff member for the appointment.</p>

      {staff.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No staff members available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((staffMember) => (
            <div
              key={staffMember._id}
              onClick={() => onStaffChange(staffMember._id)}
              className={`cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200 
                ${selectedStaffId === staffMember._id 
                  ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`
              }
            >
              <div className="flex items-center space-x-3 mb-2">
                {/* Placeholder for Avatar - assuming staffMember.avatar exists or a default */}
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  {staffMember.firstName ? staffMember.firstName.charAt(0) : '?'}{staffMember.lastName ? staffMember.lastName.charAt(0) : ''}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{staffMember.firstName} {staffMember.lastName}</p>
                  {staffMember.roles && staffMember.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {staffMember.roles.map((role: any) => (
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
              </div>
              
              {staffMember.services && staffMember.services.length > 0 && (
                <div className="mt-2 text-sm text-gray-700">
                  <p className="font-medium">Services:</p>
                  <ul className="list-disc list-inside text-xs text-gray-600">
                    {staffMember.services.map((service: any) => (
                      <li key={service._id}>{service.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-2 text-sm text-gray-700">
                <p className="font-medium">Working Hours ({selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' }) : 'Today'}):</p>
                <p className="text-xs text-gray-600">
                  {getWorkingHoursForDate(staffMember, selectedDate || new Date().toISOString())}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffSelectionTab;
