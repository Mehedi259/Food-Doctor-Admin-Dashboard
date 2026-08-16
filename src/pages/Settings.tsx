import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/services';
import toast from 'react-hot-toast';

type TabType = 'allergies' | 'eating-style' | 'medical-conditions' | 'avatars';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('allergies');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState<any>({});
  const [fileData, setFileData] = useState<File | null>(null);

  const tabs = [
    { id: 'allergies', label: 'Allergies' },
    { id: 'eating-style', label: 'Eating Styles' },
    { id: 'medical-conditions', label: 'Medical Conditions' },
    { id: 'avatars', label: 'Avatars' },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getCategories(activeTab);
      setData(Array.isArray(res) ? res : res.results || []);
    } catch (error) {
      toast.error(`Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({});
    }
    setFileData(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await deleteCategory(activeTab, id);
      toast.success('Deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let payload: any = { ...formData };
      let hasFile = false;
      
      if (activeTab === 'avatars') {
        payload = new FormData();
        if (fileData) {
          payload.append('avatar_icon', fileData);
          hasFile = true;
        } else if (!editingItem) {
          toast.error('Please select an image');
          return;
        }
      }

      if (editingItem) {
        if (activeTab === 'avatars' && !hasFile) {
          // If editing avatar but no new file selected, we don't need to update the file
          toast.success('Nothing to update');
          setIsModalOpen(false);
          return;
        }
        await updateCategory(activeTab, editingItem.id, payload, hasFile);
        toast.success('Updated successfully');
      } else {
        await createCategory(activeTab, payload, hasFile);
        toast.success('Created successfully');
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save');
    }
  };

  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'allergies':
        return <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Name</th>;
      case 'eating-style':
        return (
          <>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Details</th>
          </>
        );
      case 'medical-conditions':
        return (
          <>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Description</th>
          </>
        );
      case 'avatars':
        return <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Image</th>;
    }
  };

  const renderTableRow = (item: any) => {
    switch (activeTab) {
      case 'allergies':
        return <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{item.allergy_name}</td>;
      case 'eating-style':
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{item.eating_style_name}</td>
            <td className="px-6 py-4 text-sm text-text-secondary max-w-md truncate">{item.details}</td>
          </>
        );
      case 'medical-conditions':
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{item.medical_condition_name}</td>
            <td className="px-6 py-4 text-sm text-text-secondary max-w-md truncate">{item.medical_description}</td>
          </>
        );
      case 'avatars':
        return (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
            <img src={item.avatar_icon} alt="Avatar" className="h-12 w-12 rounded-full object-cover bg-gray-100" />
          </td>
        );
    }
  };

  const renderFormFields = () => {
    switch (activeTab) {
      case 'allergies':
        return (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.allergy_name || ''}
              onChange={(e) => setFormData({ ...formData, allergy_name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 bg-background text-text-primary"
            />
          </div>
        );
      case 'eating-style':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.eating_style_name || ''}
                onChange={(e) => setFormData({ ...formData, eating_style_name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 bg-background text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Details</label>
              <textarea
                value={formData.details || ''}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 bg-background text-text-primary h-24"
              />
            </div>
          </>
        );
      case 'medical-conditions':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.medical_condition_name || ''}
                onChange={(e) => setFormData({ ...formData, medical_condition_name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 bg-background text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
              <textarea
                value={formData.medical_description || ''}
                onChange={(e) => setFormData({ ...formData, medical_description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 bg-background text-text-primary h-24"
              />
            </div>
          </>
        );
      case 'avatars':
        return (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Avatar Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFileData(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 bg-background text-text-primary"
            />
            {editingItem && !fileData && (
              <p className="text-xs text-text-secondary mt-1">Leave empty to keep current image.</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">App Settings</h1>
          <p className="text-text-secondary mt-1">Manage app categories and master data</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-6 overflow-x-auto pb-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-surface border border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  ID
                </th>
                {renderTableHeaders()}
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">
                    Loading data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-secondary flex flex-col items-center">
                    <SettingsIcon className="h-12 w-12 mb-3 opacity-20" />
                    No data found
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {item.id}
                    </td>
                    {renderTableRow(item)}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-900 mr-4">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-rose-600 hover:text-rose-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {renderFormFields()}
              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
