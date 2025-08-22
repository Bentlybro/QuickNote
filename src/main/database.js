const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class NotesDatabase {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        try {
            const dbDir = path.join(__dirname, '../../data');
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
            
            const dbPath = path.join(dbDir, 'notes.db');
            
            // Only initialize if not already initialized
            if (!this.db) {
                this.db = new Database(dbPath);
                this.createTables();
                this.prepareStatements();
            }
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    createTables() {
        const createNotesTable = `
            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                type TEXT DEFAULT 'idea',
                tags TEXT DEFAULT '[]',
                screenshot TEXT,
                timestamp TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `;
        
        this.db.exec(createNotesTable);
    }

    prepareStatements() {
        try {
            if (!this.insertNote) {
                this.insertNote = this.db.prepare(`
                    INSERT INTO notes (id, content, type, tags, screenshot, timestamp, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);
            }
            
            if (!this.updateNote) {
                this.updateNote = this.db.prepare(`
                    UPDATE notes 
                    SET content = ?, type = ?, tags = ?, screenshot = ?, timestamp = ?, updated_at = ?
                    WHERE id = ?
                `);
            }
            
            if (!this.selectAllNotes) {
                this.selectAllNotes = this.db.prepare(`
                    SELECT * FROM notes ORDER BY timestamp DESC
                `);
            }
            
            if (!this.deleteNoteById) {
                this.deleteNoteById = this.db.prepare(`
                    DELETE FROM notes WHERE id = ?
                `);
            }
        } catch (error) {
            console.error('Statement preparation error:', error);
            throw error;
        }
    }

    saveNote(note) {
        try {
            const now = new Date().toISOString();
            
            if (note.id) {
                // Update existing note
                const result = this.updateNote.run(
                    note.content,
                    note.type || 'idea',
                    JSON.stringify(note.tags || []),
                    note.screenshot || null,
                    note.timestamp || now,
                    now,
                    note.id
                );
                
                return {
                    ...note,
                    updated_at: now
                };
            } else {
                // Create new note
                const noteId = Date.now().toString();
                
                this.insertNote.run(
                    noteId,
                    note.content,
                    note.type || 'idea',
                    JSON.stringify(note.tags || []),
                    note.screenshot || null,
                    now,
                    now,
                    now
                );
                
                return {
                    id: noteId,
                    content: note.content,
                    type: note.type || 'idea',
                    tags: note.tags || [],
                    screenshot: note.screenshot || null,
                    timestamp: now,
                    created_at: now,
                    updated_at: now
                };
            }
        } catch (error) {
            throw error;
        }
    }

    getNotes() {
        try {
            const rows = this.selectAllNotes.all();
            const notes = rows.map(row => ({
                ...row,
                tags: JSON.parse(row.tags || '[]')
            }));
            return notes;
        } catch (error) {
            throw error;
        }
    }

    deleteNote(noteId) {
        try {
            const result = this.deleteNoteById.run(noteId);
            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = NotesDatabase;