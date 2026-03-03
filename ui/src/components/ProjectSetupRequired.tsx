import { motion } from 'framer-motion'
import { Sparkles, FileEdit, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProjectSetupRequiredProps {
  projectName: string
  projectPath?: string
  onCreateWithClaude: () => void
  onEditManually: () => void
}

export function ProjectSetupRequired({
  projectName,
  projectPath,
  onCreateWithClaude,
  onEditManually,
}: ProjectSetupRequiredProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ maxWidth: '640px', margin: '32px auto 0' }}
    >
      <Card style={{
        border: '1px solid #DDEC90',
        borderRadius: '12px',
        background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(26,26,0,0.06), 0 1px 2px rgba(26,26,0,0.04)',
        overflow: 'hidden',
      }}>
        {/* Gradient header band */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(to right, #BBCB64, #FFE52A)',
          borderRadius: '9999px',
          margin: '0 24px',
          marginTop: '20px',
        }} />

        <CardHeader style={{
          textAlign: 'center',
          padding: '20px 24px 8px',
          background: 'linear-gradient(to bottom, #FAFAF2, #FFFFFF)',
        }}>
          <CardTitle style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#1A1A00',
            fontFamily: "'Geist', 'Inter', sans-serif",
            lineHeight: 1.3,
          }}>
            The Oracle Awaits Your Vision
          </CardTitle>
          <CardDescription style={{
            fontSize: '14px',
            color: '#6A6A20',
            fontFamily: "'Inter', sans-serif",
            marginTop: '4px',
          }}>
            <span style={{ fontWeight: 600, color: '#1A1A00' }}>{projectName}</span> needs a modernization specification to begin the odyssey
          </CardDescription>
          {projectPath && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', marginTop: '10px',
              fontSize: '13px', color: '#6A6A20',
            }}>
              <FolderOpen size={14} style={{ color: '#7A8A00' }} />
              <code style={{
                background: '#F5F8D0', padding: '2px 8px', borderRadius: '8px',
                fontSize: '12px', fontFamily: 'monospace', color: '#7A8A00',
                border: '1px solid #DDEC90',
              }}>
                {projectPath}
              </code>
            </div>
          )}
        </CardHeader>

        <CardContent style={{ padding: '12px 24px 24px' }}>
          <p style={{
            textAlign: 'center', color: '#6A6A20', fontSize: '13px',
            fontFamily: "'Inter', sans-serif", marginBottom: '20px',
          }}>
            Choose how you wish to define the modernization plan:
          </p>

          <div style={{
            display: 'grid', gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          }}>
            {/* Create with Claude Option */}
            <motion.div
              whileHover={{ y: -1, boxShadow: '0 4px 16px rgba(26,26,0,0.08)' }}
              transition={{ duration: 0.15 }}
              onClick={onCreateWithClaude}
              style={{
                cursor: 'pointer',
                border: '1px solid #DDEC90',
                borderRadius: '12px',
                background: '#FFFFFF',
                padding: '24px 20px',
                textAlign: 'center',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#BBCB64' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#DDEC90' }}
            >
              <div style={{
                width: '48px', height: '48px', margin: '0 auto 14px',
                background: 'linear-gradient(135deg, rgba(187,203,100,0.15), rgba(255,229,42,0.1))',
                borderRadius: '9999px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={24} style={{ color: '#7A8A00' }} />
              </div>
              <h3 style={{
                fontWeight: 700, fontSize: '16px', color: '#1A1A00',
                fontFamily: "'Geist', 'Inter', sans-serif",
                marginBottom: '8px',
              }}>
                Commune with the Oracle
              </h3>
              <p style={{
                fontSize: '13px', color: '#6A6A20', lineHeight: 1.5,
                fontFamily: "'Inter', sans-serif",
                marginBottom: '16px',
              }}>
                The oracle will analyze your codebase and craft a modernization plan
              </p>
              <Button
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #BBCB64, #7A8A00)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontFamily: "'Geist', 'Inter', sans-serif",
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <Sparkles size={16} style={{ marginRight: '6px' }} />
                Start Chat
              </Button>
            </motion.div>

            {/* Edit Manually Option */}
            <motion.div
              whileHover={{ y: -1, boxShadow: '0 4px 16px rgba(26,26,0,0.08)' }}
              transition={{ duration: 0.15 }}
              onClick={onEditManually}
              style={{
                cursor: 'pointer',
                border: '1px solid #DDEC90',
                borderRadius: '12px',
                background: '#FFFFFF',
                padding: '24px 20px',
                textAlign: 'center',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#BBCB64' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#DDEC90' }}
            >
              <div style={{
                width: '48px', height: '48px', margin: '0 auto 14px',
                background: '#F5F8D0',
                borderRadius: '9999px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileEdit size={24} style={{ color: '#6A6A20' }} />
              </div>
              <h3 style={{
                fontWeight: 700, fontSize: '16px', color: '#1A1A00',
                fontFamily: "'Geist', 'Inter', sans-serif",
                marginBottom: '8px',
              }}>
                Inscribe Manually
              </h3>
              <p style={{
                fontSize: '13px', color: '#6A6A20', lineHeight: 1.5,
                fontFamily: "'Inter', sans-serif",
                marginBottom: '16px',
              }}>
                Create the prompts directory and inscribe the sacred templates yourself
              </p>
              <Button
                variant="outline"
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#7A8A00',
                  border: '1px solid #DDEC90',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontFamily: "'Geist', 'Inter', sans-serif",
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <FileEdit size={16} style={{ marginRight: '6px' }} />
                View Templates
              </Button>
            </motion.div>
          </div>

          <p style={{
            textAlign: 'center', fontSize: '12px', color: '#9A9A60',
            fontFamily: "'Inter', sans-serif",
            marginTop: '20px', lineHeight: 1.5,
          }}>
            The modernization specification guides the gods in transforming your legacy codebase.
            It includes the analysis, target stack, migration strategy, and feature requirements.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
