import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || ''
})

export async function transcribeAudio(audioBuffer: Buffer): Promise<{
  text: string
  language: string
}> {
  try {
    // 1. Upload audio directly to AssemblyAI's API
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': process.env.ASSEMBLYAI_API_KEY || '',
        'Content-Type': 'application/octet-stream'
      },
      body: audioBuffer
    })

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`)
    }

    const { upload_url } = await uploadResponse.json()
    if (!upload_url) {
      throw new Error('No upload URL received')
    }

    // 2. Start transcription
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': process.env.ASSEMBLYAI_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: upload_url,
        language_detection: true
      })
    })

    if (!transcriptResponse.ok) {
      throw new Error(`Transcription failed: ${transcriptResponse.statusText}`)
    }

    const { id } = await transcriptResponse.json()
    if (!id) {
      throw new Error('No transcript ID received')
    }

    // 3. Poll for results
    const startTime = Date.now()
    const timeout = 30000 // 30 seconds timeout

    while (Date.now() - startTime < timeout) {
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: {
          'Authorization': process.env.ASSEMBLYAI_API_KEY || ''
        }
      })

      const result = await statusResponse.json()
      
      if (result.status === 'completed') {
        return {
          text: result.text || '',
          language: result.language_code || 'en'
        }
      }
      
      if (result.status === 'error') {
        throw new Error(result.error || 'Transcription failed')
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    throw new Error('Transcription timeout')

  } catch (error) {
    console.error('Transcription error:', error)
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Audio processing failed'
    )
  }
}