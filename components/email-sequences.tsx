'use client';

import { CheckCircleIcon, ClockIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useI18n } from 'components/i18n/provider';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface EmailSequenceTriggerProps {
  sequence: 'welcome' | 'abandoned-cart' | 're-engagement';
  email: string;
  userId?: string;
  orderId?: string;
  customData?: Record<string, any>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function EmailSequenceTrigger({
  sequence,
  email,
  userId,
  orderId,
  customData,
  onSuccess,
  onError
}: EmailSequenceTriggerProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const triggerSequence = async () => {
    setStatus('loading');

    try {
      const response = await fetch('/api/email/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequence,
          email,
          userId,
          orderId,
          customData
        })
      });

      if (response.ok) {
        const data = await response.json();
        setStatus('success');
        setMessage(`Secuencia ${sequence} programada exitosamente`);
        onSuccess?.();
      } else {
        throw new Error('Error al programar la secuencia');
      }
    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessage(errorMessage);
      onError?.(errorMessage);
    }
  };

  const sequenceInfo = {
    welcome: {
      title: 'Secuencia de Bienvenida',
      description: 'Emails automatizados para nuevos usuarios',
      emails: ['Bienvenida inmediata', 'Guía de compra (24h)', 'Oferta especial (72h)'],
      icon: CheckCircleIcon
    },
    'abandoned-cart': {
      title: 'Carrito Abandonado',
      description: 'Recupera ventas perdidas',
      emails: ['Recordatorio (1h)', 'Última oportunidad (24h)'],
      icon: ClockIcon
    },
    're-engagement': {
      title: 'Re-engagement',
      description: 'Reactiva usuarios inactivos',
      emails: ['Oferta de regreso (30 días)'],
      icon: EnvelopeIcon
    }
  };

  const info = sequenceInfo[sequence];
  const Icon = info.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-6"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {info.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {info.description}
          </p>

          <div className="space-y-2 mb-4">
            {info.emails.map((email, index) => (
              <div key={index} className="flex items-center text-sm text-gray-500">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                {email}
              </div>
            ))}
          </div>

          <button
            onClick={triggerSequence}
            disabled={status === 'loading'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Programando...
              </div>
            ) : (
              `Activar Secuencia`
            )}
          </button>

          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-3 text-sm text-center ${
                status === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Email sequences dashboard component
export function EmailSequencesDashboard() {
  const [sequences, setSequences] = useState([
    { id: 'welcome', name: 'Bienvenida', active: true, sent: 1250, opened: 425, converted: 23 },
    { id: 'abandoned-cart', name: 'Carrito Abandonado', active: true, sent: 890, opened: 234, converted: 18 },
    { id: 're-engagement', name: 'Re-engagement', active: false, sent: 456, opened: 123, converted: 12 }
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Secuencias de Email Automatizadas
        </h2>
        <p className="text-gray-600 mb-6">
          Gestiona tus campañas de email marketing automatizadas
        </p>

        <div className="grid gap-4">
          {sequences.map((seq) => (
            <div key={seq.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${seq.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div>
                  <h3 className="font-medium text-gray-900">{seq.name}</h3>
                  <div className="text-sm text-gray-500 space-x-4">
                    <span>Enviados: {seq.sent}</span>
                    <span>Aperturas: {seq.opened}</span>
                    <span>Conversiones: {seq.converted}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  seq.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {seq.active ? 'Activa' : 'Inactiva'}
                </span>
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <EmailSequenceTrigger
          sequence="welcome"
          email="user@example.com"
          onSuccess={() => console.log('Welcome sequence triggered')}
        />
        <EmailSequenceTrigger
          sequence="abandoned-cart"
          email="user@example.com"
          onSuccess={() => console.log('Abandoned cart sequence triggered')}
        />
        <EmailSequenceTrigger
          sequence="re-engagement"
          email="user@example.com"
          onSuccess={() => console.log('Re-engagement sequence triggered')}
        />
      </div>
    </div>
  );
}