import { Context } from 'hono'
import { db } from '../db/db'
import { projects } from '../db/schemes/schema'
import { desc } from 'drizzle-orm'

export const createProject = async (c: Context) => {
	try {
		const body = await c.req.json()
		const { title, description, objective, imageUrl, languages, status, maxMembers } = body

		const payload = c.get('jwtPayload') as { sub: number }
		const ownerId = payload.sub
		
		const [newProject] = await db.insert(projects).values({
			ownerId: ownerId,
      title: title,
      description: description || null,
      objective: objective || null,
      imageUrl: imageUrl || null,
      // Se languages non viene inviato, salviamo un array vuoto
      languages: languages || [], 
      maxMembers: maxMembers || 5,
		}).returning()

		return c.json({
			message: 'Progetto creato con successo',
			project: newProject
		}, 201)
	} catch (error) {
		console.log('errore: ', error)
		return c.json({ message: 'Errore nella creazione del progetto' }, 500)
	}
	
	
}