'use client';

import { useState } from 'react';
import { Folder, FolderOpen, FolderPlus, Inbox, Layers } from 'lucide-react';
import { normalizePageSlug } from '@/lib/utils/stringUtils';
import styles from './FolderTree.module.css';

export const ALL = 'all';
export const ROOT = '__root';

/** "Mon dossier é" → "mon-dossier-e" (même règle que les slugs de page) */
export function folderSlug(name = '') {
    const clean = String(name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim().replace(/\s+/g, '-');
    return normalizePageSlug(clean, { final: true });
}

/**
 * Arbre des dossiers. Chaque dossier est aussi une zone de dépôt :
 * glisser une carte de page dessus la déplace dans ce dossier.
 */
export default function FolderTree({ folders, total, rootCount, selected, dragging, onSelect, onDropPage, onCreateFolder }) {
    const [dropTarget, setDropTarget] = useState(null);
    const [landed, setLanded] = useState(null); // dossier qui vient de recevoir une page
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState('');

    const parent = selected !== ALL && selected !== ROOT ? selected : '';
    const newPath = folderSlug(name) ? [parent, folderSlug(name)].filter(Boolean).join('/') : '';

    const dropProps = (target) => ({
        onDragOver: (e) => { e.preventDefault(); setDropTarget(target); },
        onDragLeave: () => setDropTarget(null),
        onDrop: (e) => {
            e.preventDefault();
            setDropTarget(null);
            const slug = e.dataTransfer.getData('text/plain');
            if (slug) {
                onDropPage(slug, target === ROOT ? '' : target);
                setLanded(target);
                setTimeout(() => setLanded(null), 1100);
            }
        },
    });

    const submit = (e) => {
        e.preventDefault();
        if (!newPath) return;
        onCreateFolder(newPath);
        setName('');
        setCreating(false);
    };

    const item = (key, label, count, Icon, depth = 0, droppable = true) => {
        const active = selected === key;
        const over = dropTarget === key;
        const cls = `${styles.folder} ${active ? styles.folderActive : ''} ${droppable && dragging ? styles.folderReady : ''} ${over ? styles.folderDrop : ''} ${landed === key ? styles.folderLanded : ''}`;
        return (
            <li key={key}>
                <button type="button" className={cls} style={{ paddingLeft: 10 + depth * 16 }}
                    onClick={() => onSelect(key)} {...(droppable ? dropProps(key) : {})}>
                    <Icon size={16} />
                    <span className={styles.folderName}>{label}</span>
                    {over ? <span className={styles.dropLabel}>Déposer ici</span> : <span className={styles.count}>{count}</span>}
                    {landed === key && <span className={styles.plusOne} aria-hidden="true">+1</span>}
                </button>
            </li>
        );
    };

    return (
        <aside className={`${styles.panel} ${dragging ? styles.panelDragging : ''}`} aria-label="Dossiers">
            <h2 className={styles.panelTitle}>Dossiers</h2>
            <ul className={styles.list}>
                {item(ALL, 'Toutes les pages', total, Layers, 0, false)}
                {item(ROOT, 'Sans dossier', rootCount, Inbox)}
                {folders.map(([path, count]) => {
                    const depth = path.split('/').length - 1;
                    return item(path, path.split('/').pop(), count, selected === path ? FolderOpen : Folder, depth + 1);
                })}
            </ul>

            {creating ? (
                <form className={styles.newForm} onSubmit={submit}>
                    <input className={styles.input} autoFocus value={name} onChange={(e) => setName(e.target.value)}
                        placeholder={parent ? `Nouveau dossier dans ${parent}/` : 'Nom du dossier'} aria-label="Nom du dossier" />
                    {newPath && <div className={styles.preview}>/p/{newPath}/…</div>}
                    <div className={styles.row}>
                        <button type="submit" className={styles.primary} disabled={!newPath}>Créer</button>
                        <button type="button" className={styles.ghost} onClick={() => { setCreating(false); setName(''); }}>Annuler</button>
                    </div>
                </form>
            ) : (
                <button type="button" className={styles.newBtn} onClick={() => setCreating(true)}>
                    <FolderPlus size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
                    Nouveau dossier
                </button>
            )}
            <p className={styles.hint}>Glissez une page sur un dossier pour l'y ranger. L'ancienne adresse redirige automatiquement.</p>
        </aside>
    );
}

/** Fenêtre « Déplacer vers… » : même action que le glisser-déposer, utilisable au doigt */
export function MovePageDialog({ page, folders, onMove, onClose }) {
    const [name, setName] = useState('');
    const current = page.slug.includes('/') ? page.slug.split('/').slice(0, -1).join('/') : '';
    const last = page.slug.split('/').pop();
    const newPath = folderSlug(name);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.dialog} role="dialog" aria-modal="true" aria-label="Déplacer la page" onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.dialogTitle}>Déplacer « {page.title} »</h2>
                <p className={styles.dialogSub}>Adresse actuelle : /p/{page.slug}</p>

                <button type="button" className={styles.target} disabled={current === ''} onClick={() => onMove(page, '')}>
                    <Inbox size={16} /> Sans dossier
                </button>
                {folders.map(([path]) => (
                    <button key={path} type="button" className={styles.target} disabled={current === path} onClick={() => onMove(page, path)}>
                        <Folder size={16} /> {path}/
                    </button>
                ))}

                <form className={styles.newForm} onSubmit={(e) => { e.preventDefault(); if (newPath) onMove(page, newPath); }}>
                    <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="Ou un nouveau dossier (ex : guides/sommeil)" aria-label="Nouveau dossier" />
                    {newPath && <div className={styles.preview}>/p/{newPath}/{last}</div>}
                    <div className={styles.row}>
                        <button type="submit" className={styles.primary} disabled={!newPath}>Déplacer dans ce nouveau dossier</button>
                        <button type="button" className={styles.ghost} onClick={onClose}>Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
