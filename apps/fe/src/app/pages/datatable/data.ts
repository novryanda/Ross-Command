export type User = {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Editor' | 'Viewer'
  status: 'active' | 'invited' | 'suspended'
  joinedAt: string
}

export const users: User[] = [
  { id: 'USR-001', name: 'Jane Cooper', email: 'jane.cooper@example.com', role: 'Admin', status: 'active', joinedAt: '2024-01-12' },
  { id: 'USR-002', name: 'Wade Warren', email: 'wade.warren@example.com', role: 'Editor', status: 'active', joinedAt: '2024-02-03' },
  { id: 'USR-003', name: 'Esther Howard', email: 'esther.howard@example.com', role: 'Viewer', status: 'invited', joinedAt: '2024-02-19' },
  { id: 'USR-004', name: 'Cameron Williamson', email: 'cameron.williamson@example.com', role: 'Editor', status: 'active', joinedAt: '2024-03-01' },
  { id: 'USR-005', name: 'Brooklyn Simmons', email: 'brooklyn.simmons@example.com', role: 'Viewer', status: 'suspended', joinedAt: '2024-03-15' },
  { id: 'USR-006', name: 'Leslie Alexander', email: 'leslie.alexander@example.com', role: 'Admin', status: 'active', joinedAt: '2024-04-04' },
  { id: 'USR-007', name: 'Jenny Wilson', email: 'jenny.wilson@example.com', role: 'Editor', status: 'invited', joinedAt: '2024-04-21' },
  { id: 'USR-008', name: 'Robert Fox', email: 'robert.fox@example.com', role: 'Viewer', status: 'active', joinedAt: '2024-05-02' },
  { id: 'USR-009', name: 'Kristin Watson', email: 'kristin.watson@example.com', role: 'Editor', status: 'suspended', joinedAt: '2024-05-18' },
  { id: 'USR-010', name: 'Cody Fisher', email: 'cody.fisher@example.com', role: 'Admin', status: 'active', joinedAt: '2024-06-07' },
  { id: 'USR-011', name: 'Savannah Nguyen', email: 'savannah.nguyen@example.com', role: 'Viewer', status: 'active', joinedAt: '2024-06-23' },
  { id: 'USR-012', name: 'Ralph Edwards', email: 'ralph.edwards@example.com', role: 'Editor', status: 'invited', joinedAt: '2024-07-09' },
  { id: 'USR-013', name: 'Marvin McKinney', email: 'marvin.mckinney@example.com', role: 'Viewer', status: 'active', joinedAt: '2024-07-25' },
  { id: 'USR-014', name: 'Jacob Jones', email: 'jacob.jones@example.com', role: 'Admin', status: 'active', joinedAt: '2024-08-11' },
  { id: 'USR-015', name: 'Theresa Webb', email: 'theresa.webb@example.com', role: 'Editor', status: 'suspended', joinedAt: '2024-08-29' },
  { id: 'USR-016', name: 'Dianne Russell', email: 'dianne.russell@example.com', role: 'Viewer', status: 'active', joinedAt: '2024-09-14' },
  { id: 'USR-017', name: 'Devon Lane', email: 'devon.lane@example.com', role: 'Editor', status: 'active', joinedAt: '2024-10-02' },
  { id: 'USR-018', name: 'Courtney Henry', email: 'courtney.henry@example.com', role: 'Admin', status: 'invited', joinedAt: '2024-10-21' },
  { id: 'USR-019', name: 'Bessie Cooper', email: 'bessie.cooper@example.com', role: 'Viewer', status: 'active', joinedAt: '2024-11-06' },
  { id: 'USR-020', name: 'Floyd Miles', email: 'floyd.miles@example.com', role: 'Editor', status: 'active', joinedAt: '2024-11-23' },
  { id: 'USR-021', name: 'Darlene Robertson', email: 'darlene.robertson@example.com', role: 'Viewer', status: 'suspended', joinedAt: '2024-12-08' },
  { id: 'USR-022', name: 'Ronald Richards', email: 'ronald.richards@example.com', role: 'Admin', status: 'active', joinedAt: '2025-01-04' },
  { id: 'USR-023', name: 'Annette Black', email: 'annette.black@example.com', role: 'Editor', status: 'invited', joinedAt: '2025-01-19' },
  { id: 'USR-024', name: 'Jerome Bell', email: 'jerome.bell@example.com', role: 'Viewer', status: 'active', joinedAt: '2025-02-05' },
  { id: 'USR-025', name: 'Arlene McCoy', email: 'arlene.mccoy@example.com', role: 'Editor', status: 'active', joinedAt: '2025-02-22' }
]
