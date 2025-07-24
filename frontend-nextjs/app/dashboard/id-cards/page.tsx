'use client';

import { useState } from 'react';

export default function IDCardsPage() {
  const [idCards, setIdCards] = useState([
    {
      id: 1,
      name: 'John Doe',
      type: 'student',
      cardNumber: 'STU123456789',
      status: 'printed',
      validUntil: '2025-03-31',
      digitalWallet: true,
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      type: 'teacher',
      cardNumber: 'TEA987654321',
      status: 'pending',
      validUntil: '2025-03-31',
      digitalWallet: false,
      createdAt: '2024-01-14',
    },
  ]);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const handleBulkGenerate = () => {
    // Mock bulk generation
    alert(`Generating ID cards for ${selectedUsers.length} users`);
    setShowBulkModal(false);
    setSelectedUsers([]);
  };

  const handleDownload = (cardId: number) => {
    // Mock download
    alert(`Downloading ID card ${cardId}`);
  };

  const handleAddToWallet = (cardId: number) => {
    setIdCards(cards => 
      cards.map(card => 
        card.id === cardId ? { ...card, digitalWallet: true } : card
      )
    );
  };

  const updatePrintStatus = (cardId: number, status: string) => {
    setIdCards(cards => 
      cards.map(card => 
        card.id === cardId ? { ...card, status } : card
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ID Card Management</h1>
            <p className="mt-2 text-gray-600">Generate, manage, and track digital ID cards</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Bulk Generate
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Generate Single
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">📄</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Cards</dt>
                    <dd className="text-lg font-medium text-gray-900">{idCards.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">✓</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Printed</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {idCards.filter(card => card.status === 'printed').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">⏳</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {idCards.filter(card => card.status === 'pending').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">📱</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Digital Wallet</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {idCards.filter(card => card.digitalWallet).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ID Cards Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Card Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Digital Wallet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valid Until
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {idCards.map((card) => (
                    <tr key={card.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{card.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          card.type === 'student' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {card.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {card.cardNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={card.status}
                          onChange={(e) => updatePrintStatus(card.id, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-2 py-1 ${
                            card.status === 'printed' ? 'bg-green-100 text-green-800' :
                            card.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="printed">Printed</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {card.digitalWallet ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Added
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddToWallet(card.id)}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            Add to Wallet
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(card.validUntil).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDownload(card.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Download
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bulk Generation Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Generate ID Cards</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User Type:
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Class/Department:
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">All</option>
                    <option value="class-1">Class 1</option>
                    <option value="class-2">Class 2</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowBulkModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkGenerate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}