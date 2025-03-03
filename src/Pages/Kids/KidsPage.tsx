import React, { useState, useEffect } from 'react';
import { Kid } from '../../types.ts';
import { calculateAge, KidManager, updateDateYearTo4digits } from '../../services/kidManager.ts';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Pencil, Trash } from 'lucide-react';
import { useAuth } from '../../Users/AuthContext';
import AddKidForm from './AddKidForm';


export const KidsPage = () => {
  const {user, getCurrentUserFamily} = useAuth(); // Get the logged-in user
  const [kids, setKids] = useState<Kid[]>([]);
  const [filteredKids, setFilteredKids] = useState<Kid[]>([]);
  const [newKid, setNewKid] = useState<Partial<Kid>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editKidId, setEditKidId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [kidToDelete, setKidToDelete] = useState<string | null>(null);
  

  // Filter kids based on user's family
  const filterKidsForCurrentUser = (kidsData: Kid[]) => {
    if (!user) {
      setFilteredKids([]);
      return;
    }
    
    if (user.role === 'admin' ) {
      // Admins see all kids - for owners to see all -> add this to the if: || user.role === 'owner'
      setFilteredKids(kidsData);
    } else {
      // Regular users only see kids from their family
      const userFamily = getCurrentUserFamily();
      if (userFamily) {
        const familyKids = kidsData.filter(kid => kid.familyId === userFamily.id);
        setFilteredKids(familyKids);
        console.log ('filtered kids', {familyKids, userFamily, kidsData});
      } else {
        setFilteredKids([]);
      }
    }
  };
  
  const saveKid = async () => {
    const lastUpdated = new Date();
    const formattedDate = `${lastUpdated.getDate().toString().padStart(2, '0')}/${
      (lastUpdated.getMonth() + 1).toString().padStart(2, '0')
    }/${lastUpdated.getFullYear()}`;

    const userFamily = getCurrentUserFamily();
    const familyId = userFamily ? userFamily.id : '';
    const familyName = userFamily ? userFamily.name : '';

    const sanitizedBirthDate = newKid.birthDate 
    ? newKid.birthDate.replace(/\./g, "/") // Replace dots with slashes
    : "";

    const { age, ...kidDataWithoutAge } = {
      ...newKid,
      id: editKidId || Date.now().toString(),
      birthDate: sanitizedBirthDate ? updateDateYearTo4digits(sanitizedBirthDate) : "", // Handle undefined case
      lastUpdated: formattedDate,
      family: newKid.family || familyName, // Set family to current user's family if not specified
      familyId: newKid.familyId || familyId, // Set family to current user's family if not specified
    };
  
    try {
      await fetch('/api/saveToJsonFile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'kids',
          data: kidDataWithoutAge,
          type: 'kids',
        })
      });


     // Calculate the age locally and update the state
     const updatedKidData = {
      ...kidDataWithoutAge,
      age: calculateAge(newKid.birthDate || ''),
      lastUpdated: formattedDate,
    };

    if (isEditMode) {
      const updatedKids = kids.map(kid => (kid.id === editKidId ? updatedKidData as Kid : kid));
      setKids (updatedKids);
      filterKidsForCurrentUser(updatedKids);
    } else {
      const updatedKids = [...kids, updatedKidData as Kid];
      setKids(updatedKids);
      filterKidsForCurrentUser(updatedKids);
    }
    handleCloseModal();
    } catch (error) {
      console.error('Error saving kid:', error);
    }
  };

  const handleCloseModal = () => {
    setNewKid({});
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditKidId(null);
  };

  const editKid = (kid: Kid) => {
    console.log ('edit kid', {kid});
    setNewKid(kid);
    setIsModalOpen(true);
    setIsEditMode(true);
    setEditKidId(kid.id);
  };

  const deleteKid = async (id: string) => {
    try {
      console.log ('in delete before set', {kids})
      const updatedKidData = kids.filter(kid => kid.id !== id);

      await fetch(`/api/saveToJsonFile/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'kids',
          data: updatedKidData,
          type: 'kids',
        })
      });
      setKids(updatedKidData);
      filterKidsForCurrentUser (updatedKidData);
    } catch (error) {
      console.error('Error deleting kid:', error);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const itemsToReorder = user?.role === 'admin' || user?.role === 'owner' 
    ? [...kids]
    : [...filteredKids];

    // const reorderedKids = Array.from(kids);
    const [movedKid] = itemsToReorder.splice(result.source.index, 1);
    itemsToReorder.splice(result.destination.index, 0, movedKid);
    console.log ('onDragEnd reorderedKids', {itemsToReorder});
    
    // If we're reordering filtered kids, we need to merge the changes back into the full list
    let reorderedKids = [...kids];
    if (user?.role !== 'admin' && user?.role !== 'owner') {
      // Create a map of the original positions
      const kidMap = new Map(kids.map(kid => [kid.id, kid]));
      
      // Update the map with the new order for the filtered items
      itemsToReorder.forEach(kid => {
        kidMap.set(kid.id, kid);
      });
      
      // Convert back to array
      reorderedKids = Array.from(kidMap.values());
    } else {
      reorderedKids = itemsToReorder;
    }

    try {
      await fetch ('/api/saveToJsonFile',{
        method: 'POST',
        headers: { 'content-Type':'application/json'},
        body: JSON.stringify({
          filename: 'kids',
          data: reorderedKids,
          type: 'kids-order',
        }),
      });
      setKids(reorderedKids);
      filterKidsForCurrentUser(reorderedKids);
      console.log ('Order saved successfully');
    } catch (error) {
      console.error('Error saving kids order:', error);
    }
  };

  const toggleRowExpansion = (kidId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(kidId)) {
      newExpandedRows.delete(kidId);
    } else {
      newExpandedRows.add(kidId);
    }
    setExpandedRows(newExpandedRows);
  };

  useEffect(() => {
    const fetchKids = async () => {
      const loadedKids = await KidManager.loadKids();
      console.log ('Page-kids use effect loaded kids', {loadedKids});
      setKids(loadedKids);
      filterKidsForCurrentUser(loadedKids);
    };
    fetchKids().catch(error => console.error('Error in useEffect fetchKids:', error));
  }, [user]);
  

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 bg-white">
      <h1 className="text-2xl text-emerald-600 mb-6">ילדים</h1>
      {user?.role === 'admin' || user?.role === 'owner' ? (    
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 mb-4"
      >
        הוסף ילד
      </button>
      ) : null }
      <AddKidForm
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        kidData={newKid}
        userRole={user?.role || null}
        onClose={handleCloseModal}
        onSave={saveKid}
        onKidDataChange={setNewKid}
      />
      <div className="w-full max-w-2xl">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="kidsList">
          {(provided) => (
            <div  {...provided.droppableProps} 
              ref={provided.innerRef}
              className="space-y-4"
            >
            {filteredKids && filteredKids.length > 0 ? (
              filteredKids.map((kid: Kid, index: number) => (
                <Draggable 
                  key={kid.id || `kid-${index}`}
                  draggableId={kid.id ? kid.id.toString(): `kid-${index}`} 
                  index={index}>
                  {(providedDraggable) => (
                    <div 
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      {...providedDraggable.dragHandleProps}
                      className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                      <div 
                        className="flex justify-between items-center w-full cursor-pointer p-2"
                        onClick={() => toggleRowExpansion(kid.id)}
                        >
                        <h3 className="text-lg font-medium flex-1">{kid.name}</h3>
                        <span className="text-gray-600 mx-4">גיל: {kid.age}</span>
                          {user?.role === 'admin' || user?.role === 'owner' ? (    
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) =>{e.stopPropagation(); editKid(kid);}}
                            className="hover:bg-gray-100 p-1 rounded-full transition-colors"
                            >
                            {/* ערוך */}
                            <Pencil size={16} className="text-blue-500" />
                          </button>
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setKidToDelete(kid.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="hover:bg-gray-100 p-1 rounded-full transition-colors"
                            >
                            {/* מחק */}
                            <Trash size={16} className="text-red-500" />
                          </button>
                        </div>
                        ): null}
                      </div>

                      {expandedRows.has(kid.id) && (
                       <div className="mt-2 text-gray-500 text-sm space-y-1 bg-gray-100 p-2 rounded-lg">
                        {kid.birthDate && (
                          <p>תאריך לידה: {new Date(kid.birthDate.split('/').reverse().join('-')).toLocaleDateString('he-IL')}</p>
                        )}
                        {kid.weight && (
                          <p>משקל: {kid.weight} ק"ג</p>
                        )}
                        {kid.favoriteMedicine && (
                          <p>תרופה מועדפת: {kid.favoriteMedicine}</p>
                        )}
                          <p className={KidManager.checkLastUpdatedStatus(kid.age, kid.lastUpdated).color}>
                            עודכן לאחרונה: {kid.lastUpdated}
                          </p>
                        {user?.role === 'admin' ? (
                          <p>משפחה: {kid.family}</p>
                          // <p>משפחה: {getCurrentUserFamily()?.name || kid.family}</p>
                        ) : null}
                        </div>
                      )}

                    </div>
                  )}
               </Draggable>
             ))
            ):(<p>אין ילדים להצגה</p>)}
          {provided.placeholder}
        </div>
            )}
        </Droppable>
      </DragDropContext>
      </div>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-medium">האם אתה בטוח שברצונך למחוק את הילד?</p>
            <div className="mt-4 flex justify-center space-x-4 gap-2">
              <button
                onClick={() => {
                  if (kidToDelete) {
                    deleteKid(kidToDelete);
                  }
                  setIsDeleteModalOpen(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                מחק
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default KidsPage;