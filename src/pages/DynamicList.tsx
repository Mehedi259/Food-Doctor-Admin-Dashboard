import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Database, AlertCircle } from 'lucide-react';
import { useSchema } from '../context/SchemaContext';
import { getDynamicList, createDynamicItem, updateDynamicItem, deleteDynamicItem } from '../api/services';
import toast from 'react-hot-toast';

export default function DynamicList() {
  const { appLabel, modelName } = useParams();
  const { schema, loading: schemaLoading } = useSchema();
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [fileData, setFileData] = useState<Record<string, File | null>>({});

  const appSchema = schema?.[appLabel || ''];
  const modelSchema = appSchema?.models.find((m: any) => m.model_name === modelName);

  useEffect(() => {
    if (appLabel && modelName && modelSchema) {
      fetchData();
    }
  }, [appLabel, modelName, modelSchema]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getDynamicList(appLabel!, modelName!);
      setData(Array.isArray(res) ? res : res.results || []);
    } catch (error) {
      toast.error(`Failed to load data`);
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
    setFileData({});
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDynamicItem(appLabel!, modelName!, id);
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
      let hasFile = Object.keys(fileData).length > 0;
      
      if (hasFile) {
        payload = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
             payload.append(key, formData[key]);
          }
        });
        Object.keys(fileData).forEach(key => {
          if (fileData[key]) {
            payload.append(key, fileData[key] as Blob);
          }
        });
      }

      if (editingItem) {
        await updateDynamicItem(appLabel!, modelName!, editingItem.id || editingItem.pk, payload, hasFile);
        toast.success('Updated successfully');
      } else {
        await createDynamicItem(appLabel!, modelName!, payload, hasFile);
        toast.success('Created successfully');
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.message || 'Failed to save');
    }
  };

  if (schemaLoading) return <div className="p-8 text-text-secondary">Loading schema...</div>;
  if (!modelSchema) return <div className="p-8 text-rose-500">Model not found in schema.</div>;

  const fields = modelSchema.fields.filter((f: any) => f.name !== 'id');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-text-secondary text-sm mb-1">
            <Database className="h-4 w-4 mr-1" />
            <span className="uppercase tracking-wider">{appSchema.app_name}</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">{modelSchema.verbose_name_plural}</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {modelSchema.verbose_name}
        </button>
      </div>

      <div className="bg-surface border border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  ID
                </th>
                {fields.slice(0, 5).map((field: any) => (
                  <th key={field.name} scope="col" className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    {field.label}
                  </th>
                ))}
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={fields.length + 2} className="px-6 py-12 text-center text-text-secondary">
                    Loading data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={fields.length + 2} className="px-6 py-12 text-center text-text-secondary flex flex-col items-center">
                    <AlertCircle className="h-12 w-12 mb-3 opacity-20" />
                    No data found
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id || item.pk} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {item.id || item.pk}
                    </td>
                    {fields.slice(0, 5).map((field: any) => (
                      <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-text-primary max-w-[200px] truncate">
                        {field.type === 'file' || field.type === 'url' ? (
                          item[field.name] ? <img src={item[field.name]} alt="img" className="h-8 w-8 object-cover rounded bg-background" /> : '-'
                        ) : field.type === 'boolean' ? (
                          item[field.name] ? 'Yes' : 'No'
                        ) : (
                          String(item[field.name] ?? '-')
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-900 mr-4">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id || item.pk)} className="text-rose-600 hover:text-rose-900">
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

      {/* Dynamic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto pt-24 pb-12">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center sticky top-0 bg-surface z-10">
              <h3 className="text-lg font-bold text-text-primary">
                {editingItem ? `Edit ${modelSchema.verbose_name}` : `Add New ${modelSchema.verbose_name}`}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                {fields.filter((f: any) => !f.readonly).map((field: any) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <textarea
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 bg-background text-text-primary h-24"
                      />
                    ) : field.type === 'boolean' ? (
                      <select
                        value={formData[field.name] ? 'true' : 'false'}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 bg-background text-text-primary"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : field.type === 'file' ? (
                      <div>
                        <input
                          type="file"
                          required={field.required && !editingItem}
                          onChange={(e) => setFileData({ ...fileData, [field.name]: e.target.files?.[0] || null })}
                          className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 bg-background text-text-primary"
                        />
                        {editingItem && !fileData[field.name] && formData[field.name] && (
                          <div className="mt-2 text-xs text-text-secondary">Current file exists. Upload new to replace.</div>
                        )}
                      </div>
                    ) : field.choices ? (
                      <select
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 bg-background text-text-primary"
                      >
                        <option value="">Select...</option>
                        {field.choices.map((c: any) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 bg-background text-text-primary"
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="pt-4 mt-6 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-surface">
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
                  Save {modelSchema.verbose_name}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
