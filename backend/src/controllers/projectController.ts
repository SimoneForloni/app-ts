import { Context } from 'hono'
import { db } from '../db/db'
import { projects, users } from '../db/schemes/schema'
import { and, desc, eq } from 'drizzle-orm'

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

export const getAllProjects = async (c: Context) => {
	try {
		const allProjects = await db.select({
			id: projects.id,
			title: projects.title,
			description: projects.description,
			languages: projects.languages,
			status: projects.status,
			author: users.username, // Prendiamo lo username dalla tabella users
			createdAt: projects.createdAt
		})
		.from(projects)
		.leftJoin(users, eq(projects.ownerId, users.id))
		.orderBy(desc(projects.createdAt))

		return c.json(allProjects)
	} catch (error) {
		console.log('errore: ', error)
		return c.json({ message: 'Errore nel caricamento dei progetti' }, 500)
	}
}

export const getMyProjects = async (c: Context) => {
	try {
		const payload = c.get('jwtPayload') as { sub: number}
		const userId = payload.sub

		const myProjects = await db
			.select()
			.from(projects)
			.where(eq(projects.ownerId, userId))
			.orderBy(desc(projects.createdAt))

			return c.json(myProjects)
	} catch (error) {
		console.log('errore: ', error)
		return c.json({ message: 'Errore nel caricamento dei progetti' }, 500)
	}
}

export const deleteProject = async (c: Context) => {
	const id = Number(c.req.param('id'))
	const payload = c.get('jwtPayload') as { sub: number}
	const ownerId = payload.sub

	try {
		const deleted = await db.delete(projects)
			.where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
			.returning()

		if (deleted.length == 0) {
			return c.json({ message: "Progetto non trovato o non sei l'autore" }, 404)			
		}

		return c.json({ message: 'Progetto eliminato con successo' })
	} catch (error) {
		console.log('errore: ', error)
		return c.json({ message: 'Errore nella cancellazione del progetto' }, 500)
	}
}