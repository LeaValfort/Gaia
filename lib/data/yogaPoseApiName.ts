/** Noms anglais pour l’API yoga (recherche par nom). */
export const YOGA_POSE_NAME_EN: Record<string, string> = {
  "Posture de l'enfant": 'Child',
  'Papillon couché': 'Bound Angle',
  'Torsion douce allongée': 'Supine Twist',
  'Jambes au mur': 'Legs Up The Wall',
  'Pigeon couché': 'Pigeon',
  Sphinx: 'Sphinx',
  'Pince assise': 'Seated Forward Bend',
  Savasana: 'Corpse',
  'Salutation au soleil A': 'Sun Salutation',
  'Guerrier 1': 'Warrior One',
  'Guerrier 2': 'Warrior Two',
  'Chien tête en bas': 'Downward Dog',
  'Fente basse': 'Low Lunge',
  'Torsion assise': 'Seated Twist',
  Pont: 'Bridge',
  'Salutation au soleil B': 'Sun Salutation',
  'Guerrier 3': 'Warrior Three',
  'Planche latérale': 'Side Plank',
  'Crow (Bakasana)': 'Crow',
  'Torsion debout': 'Revolved Chair',
  'Demi-lune': 'Half Moon',
  Bateau: 'Boat',
}

export function nomPosePourApi(nomFr: string): string {
  return YOGA_POSE_NAME_EN[nomFr] ?? nomFr.split(/[\s—]+/)[0] ?? 'Yoga'
}
