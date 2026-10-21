import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { Megaphone, Plus, Pencil, Trash2, Power, Save, X } from 'lucide-react';
import { apiService } from '../../services/apiService';

const blank = { title: '', description: '', image: '', linkUrl: '', buttonText: 'Ver más información', badge: 'Aviso Importante', is_active: true, display_order: 0, start_date: '', end_date: '' };
const AnuncioAdmin = () => {
  const client = useQueryClient();
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { data: anuncios = [], isLoading, error } = useQuery({ queryKey: ['anuncios'], queryFn: apiService.getAnuncios });
  const refresh = () => client.invalidateQueries({ queryKey: ['anuncios'] });
  const reportError = error => Swal.fire('No se pudo completar la acción', error.message, 'error');
  const save = useMutation({ mutationFn: apiService.saveAnuncio, onSuccess: () => { setForm(null); refresh(); }, onError: reportError });
  const remove = useMutation({ mutationFn: apiService.deleteAnuncio, onSuccess: refresh, onError: reportError });
  const toggle = useMutation({ mutationFn: apiService.toggleAnuncioStatus, onSuccess: refresh, onError: reportError });
  const change = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const submit = event => { event.preventDefault(); save.mutate({ ...form, is_active: form.is_active ? 1 : 0, display_order: Number(form.display_order || 0) }); };
  const upload = async file => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { Swal.fire('Formato inválido', 'Selecciona una imagen.', 'warning'); return; }
    setUploading(true);
    try { const result = await apiService.uploadAnuncioImage(file); change('image', result.url); }
    catch (e) { Swal.fire('Error al subir', e.message, 'error'); }
    finally { setUploading(false); }
  };
  const confirmDelete = async item => {
    const result = await Swal.fire({ title: '¿Eliminar este anuncio?', text: item.title, icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar', confirmButtonColor: '#B22222' });
    if (result.isConfirmed) remove.mutate(item.id);
  };

  return <div className="admin-card">
    <div className="admin-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div className="d-flex align-items-center gap-2"><Megaphone className="text-danger" size={24}/><div><h5 className="admin-card-title mb-0">Anuncios del portal</h5><small className="text-muted">Administra flyers, enlaces y fechas de publicación.</small></div></div>
      <button className="btn btn-admin-primary d-flex gap-2 align-items-center" onClick={() => setForm({ ...blank })}><Plus size={17}/> Nuevo anuncio</button>
    </div>
    {error && <div className="alert alert-danger m-3">{error.message}</div>}
    {isLoading ? <div className="p-4 text-center">Cargando anuncios…</div> : anuncios.length === 0 ? <div className="p-4 text-center text-muted">Todavía no hay anuncios. Crea uno para mostrarlo en el portal.</div> : <div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>Orden</th><th>Anuncio</th><th>Vigencia</th><th>Estado</th><th className="text-end">Acciones</th></tr></thead><tbody>{anuncios.map(item => <tr key={item.id}><td>{item.display_order}</td><td><div className="d-flex align-items-center gap-3">{item.image && <img src={item.image} alt="" style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 6 }}/>}<div><strong>{item.title}</strong><div className="small text-muted">{item.linkUrl || 'Sin enlace'}</div></div></div></td><td className="small">{item.start_date || '—'}<br/>a {item.end_date || '—'}</td><td><span className={`badge ${item.is_active ? 'bg-success' : 'bg-secondary'}`}>{item.is_active ? 'Publicado' : 'Oculto'}</span></td><td className="text-end"><div className="d-inline-flex gap-1"><button className="btn btn-sm btn-outline-secondary" title="Editar" onClick={() => setForm({ ...blank, ...item, is_active: Boolean(item.is_active), start_date: item.start_date || '', end_date: item.end_date || '' })}><Pencil size={15}/></button><button className="btn btn-sm btn-outline-primary" title={item.is_active ? 'Desactivar anuncio' : 'Activar anuncio'} aria-label={item.is_active ? 'Desactivar anuncio' : 'Activar anuncio'} disabled={toggle.isPending} onClick={() => toggle.mutate(item.id)}><Power size={15}/></button><button className="btn btn-sm btn-outline-danger" title="Eliminar" onClick={() => confirmDelete(item)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>}
    {form && <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'rgba(0,0,0,.55)', zIndex: 3000 }} onMouseDown={e => { if (e.target === e.currentTarget) setForm(null); }}><div className="bg-white rounded-3 shadow-lg w-100" style={{ maxWidth: 760, maxHeight: '92vh', overflowY: 'auto' }}><div className="d-flex justify-content-between align-items-center p-3 border-bottom"><h5 className="mb-0">{form.id ? 'Editar anuncio' : 'Nuevo anuncio'}</h5><button className="btn btn-light btn-sm" onClick={() => setForm(null)}><X size={18}/></button></div><form onSubmit={submit} className="p-3"><div className="row g-3">
      <div className="col-md-8"><label className="form-label">Título</label><input className="form-control" required value={form.title} onChange={e => change('title', e.target.value)}/></div>
      <div className="col-md-4"><label className="form-label">Etiqueta</label><input className="form-control" value={form.badge || ''} onChange={e => change('badge', e.target.value)}/></div>
      <div className="col-12"><label className="form-label">Descripción</label><textarea className="form-control" rows="2" value={form.description || ''} onChange={e => change('description', e.target.value)}/></div>
      <div className="col-md-7"><label className="form-label">Imagen del flyer</label><input className="form-control" type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e => upload(e.target.files?.[0])}/><input className="form-control mt-2" placeholder="o pega una URL/ruta de imagen" value={form.image || ''} onChange={e => change('image', e.target.value)}/>{uploading && <small>Subiendo imagen…</small>}</div>
      <div className="col-md-5">{form.image && <img src={form.image} alt="Vista previa del anuncio" className="img-fluid rounded" style={{ maxHeight: 140 }}/>}</div>
      <div className="col-md-8"><label className="form-label">Enlace</label><input type="url" className="form-control" placeholder="https://…" value={form.linkUrl || ''} onChange={e => change('linkUrl', e.target.value)}/></div>
      <div className="col-md-4"><label className="form-label">Texto del botón</label><input className="form-control" value={form.buttonText || ''} onChange={e => change('buttonText', e.target.value)}/></div>
      <div className="col-md-4"><label className="form-label">Orden</label><input type="number" className="form-control" value={form.display_order ?? 0} onChange={e => change('display_order', e.target.value)}/></div>
      <div className="col-md-4"><label className="form-label">Desde</label><input type="date" className="form-control" value={form.start_date || ''} onChange={e => change('start_date', e.target.value)}/></div>
      <div className="col-md-4"><label className="form-label">Hasta</label><input type="date" className="form-control" value={form.end_date || ''} onChange={e => change('end_date', e.target.value)}/></div>
      <div className="col-12"><div className="form-check form-switch"><input className="form-check-input" type="checkbox" checked={Boolean(form.is_active)} onChange={e => change('is_active', e.target.checked)}/><label className="form-check-label">Publicado</label></div></div>
    </div><div className="d-flex justify-content-end gap-2 mt-4"><button type="button" className="btn btn-outline-secondary" onClick={() => setForm(null)}>Cancelar</button><button className="btn btn-admin-primary" disabled={save.isPending || uploading}><Save size={16} className="me-1"/>{save.isPending ? 'Guardando…' : 'Guardar anuncio'}</button></div></form></div></div>}
  </div>;
};
export default AnuncioAdmin;
