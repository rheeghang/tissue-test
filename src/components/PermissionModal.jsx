import React from 'react'

const PermissionModal = ({ onRequestPermission }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl text-black">
      <h2 className="text-xl font-bold mb-4">권한 요청</h2>
      <p className="mb-4">기기 방향 감지 권한을 허용해 주세요.</p>
      <button
        onClick={onRequestPermission}
        className="bg-exhibition-bg text-exhibition-text px-4 py-2 rounded hover:opacity-90 transition-opacity"
      >
        권한 허용하기
      </button>
    </div>
  </div>
)

export default PermissionModal 