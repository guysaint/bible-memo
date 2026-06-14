import type { SessionMode, Verse } from '../../types';
import { Modal } from '../ui/Modal';
import { verseRef } from '../../services/verseLabel';
import { MODE_LIST } from './modeMeta';

interface ModeSelectModalProps {
  verse: Verse | null;
  onClose: () => void;
  onSelect: (mode: SessionMode) => void;
}

export function ModeSelectModal({ verse, onClose, onSelect }: ModeSelectModalProps) {
  return (
    <Modal open={!!verse} onClose={onClose} title="연습 모드 선택">
      {verse && (
        <>
          <p className="-mt-2 mb-4 text-sm font-medium text-bible-primary">{verseRef(verse)}</p>
          <div className="grid grid-cols-1 gap-2.5">
            {MODE_LIST.map((m) => (
              <button
                key={m.mode}
                onClick={() => onSelect(m.mode)}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 text-left transition-active hover:border-bible-primary/40 active:scale-[0.98]"
              >
                <span className="text-2xl">{m.icon}</span>
                <span>
                  <span className="block text-sm font-semibold text-gray-800">{m.label}</span>
                  <span className="block text-xs text-gray-400">{m.description}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
