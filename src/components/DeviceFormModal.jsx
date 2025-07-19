import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-toastify';

const DeviceFormModal = ({ device, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [installedAt, setInstalledAt] = useState('');
  const [note, setNote] = useState('');

  const isEditing = !!device;

  useEffect(() => {
    if (isEditing) {
      setName(device.name);
      setInstalledAt(device.installed_at);
      setNote(device.note);
    } else {
      // '추가' 모드일 때 폼을 초기화합니다.
      setName('');
      setInstalledAt('');
      setNote('');
    }
  }, [device, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !installedAt) {
      toast.warn('장비명과 설치일을 입력해주세요.');
      return;
    }
    onSave({ name, installed_at: installedAt, note });
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {isEditing ? '장비 정보 수정' : '새 장비 등록'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">장비명</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="installedAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">설치일</label>
            <input
              type="date"
              id="installedAt"
              value={installedAt}
              onChange={(e) => setInstalledAt(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300">비고</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="3"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default DeviceFormModal; 