import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Database, AlertCircle, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
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

  if (schemaLoading) return (
    <div className="flex flex-col items-center justify-center h-64 text-primary">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
      <p className="font-medium animate-pulse">Loading Schema...</p>
    </div>
  );
  if (!modelSchema) return (
    <div className="flex flex-col items-center justify-center h-64 text-rose-500 bg-rose-50/50 rounded-3xl border border-rose-100">
      <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
      <p className="font-medium">Model not found in schema.</p>
    </div>
  );

  const fields = modelSchema.fields.filter((f: any) => f.name !== 'id');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl p-6 sm:p-8 border border-primary/10 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center text-primary text-sm font-semibold mb-2">
              <Database className="h-4 w-4 mr-1.5" />
              <span className="uppercase tracking-widest">{appSchema.app_name}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
              {modelSchema.verbose_name_plural}
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
              Manage and organize your {modelSchema.verbose_name.toLowerCase()} data efficiently.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="group relative flex items-center justify-center py-3 px-6 rounded-2xl font-bold text-white shadow-lg hover:shadow-primary/30 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 group-hover:scale-105 transition-transform duration-300"></div>
            <span className="relative flex items-center">
              <Plus className="h-5 w-5 mr-2" strokeWidth={3} />
              Add {modelSchema.verbose_name}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-surface rounded-3xl shadow-sm border border-border overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-border bg-background/50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input 
              type="text" 
              placeholder={`Search ${modelSchema.verbose_name_plural.toLowerCase()}...`}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button className="p-2 border border-border rounded-xl text-text-secondary hover:bg-background hover:text-text-primary transition-colors">
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-background/80 backdrop-blur-sm">
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">
                  ID
                </th>
                {fields.slice(0, 5).map((field: any) => (
                  <th key={field.name} scope="col" className="px-6 py-4 text-left text-xs font-bold text-text-secondary uppercase tracking-widest">
                    {field.label}
                  </th>
                ))}
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-text-secondary uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {loading ? (
                <tr>
                  <td colSpan={fields.length + 2} className="px-6 py-20 text-center">
                    <div className="inline-flex flex-col items-center justify-center text-primary">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
                      <span className="text-sm font-medium">Fetching Records...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={fields.length + 2} className="px-6 py-24 text-center">
                    <div className="inline-flex flex-col items-center justify-center text-text-secondary">
                      <div className="bg-background p-4 rounded-full mb-4">
                        <AlertCircle className="h-8 w-8 text-primary/40" />
                      </div>
                      <p className="text-base font-medium text-text-primary">No records found</p>
                      <p className="text-sm mt-1">Get started by creating a new {modelSchema.verbose_name.toLowerCase()}.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id || item.pk} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-secondary">
                      #{item.id || item.pk}
                    </td>
                    {fields.slice(0, 5).map((field: any) => (
                      <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-text-primary max-w-[200px] truncate">
                        {field.type === 'file' || field.type === 'url' ? (
                          item[field.name] ? (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border group-hover:border-primary/20 transition-colors">
                              <img src={item[field.name]} alt="img" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <span className="text-text-secondary italic text-xs">No image</span>
                          )
                        ) : field.type === 'boolean' ? (
                          item[field.name] ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                              <XCircle className="w-3 h-3 mr-1" /> No
                            </span>
                          )
                        ) : (
                          <span className="font-medium text-text-primary/90">{String(item[field.name] ?? '-')}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(item)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id || item.pk)} 
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md overflow-y-auto pt-24 pb-12 animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto border border-white/20 transform animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-border flex justify-between items-center sticky top-0 bg-surface/90 backdrop-blur-md z-10">
              <div>
                <h3 className="text-xl font-bold text-text-primary tracking-tight">
                  {editingItem ? `Edit ${modelSchema.verbose_name}` : `Create New ${modelSchema.verbose_name}`}
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  {editingItem ? 'Update the details below.' : 'Fill in the details to create a new record.'}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 bg-background hover:bg-border rounded-full text-text-secondary hover:text-text-primary transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {fields.filter((f: any) => !f.readonly).map((field: any) => (
                  <div key={field.name} className={`${field.type === 'textarea' || field.type === 'file' ? 'sm:col-span-2' : ''}`}>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <textarea
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm h-32 resize-none shadow-inner"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    ) : field.type === 'boolean' ? (
                      <div className="relative">
                        <select
                          value={formData[field.name] ? 'true' : 'false'}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value === 'true' })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-inner appearance-none"
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                    ) : field.type === 'file' ? (
                      <div className="w-full px-4 py-3 bg-background border border-dashed border-primary/30 rounded-2xl hover:border-primary/60 transition-colors cursor-pointer text-center group">
                        <input
                          type="file"
                          required={field.required && !editingItem}
                          onChange={(e) => setFileData({ ...fileData, [field.name]: e.target.files?.[0] || null })}
                          className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                        />
                        {editingItem && !fileData[field.name] && formData[field.name] && (
                          <div className="mt-3 inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Current file uploaded
                          </div>
                        )}
                      </div>
                    ) : field.choices ? (
                      <select
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-inner"
                      >
                        <option value="" disabled>Select {field.label}</option>
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
                        className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-inner"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="pt-6 mt-8 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-surface">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-background border border-border hover:bg-border/50 rounded-xl text-sm font-bold text-text-secondary hover:text-text-primary transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
