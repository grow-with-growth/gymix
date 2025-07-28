// Script to seed the database with sample learning objectives

import { dbConnection } from '../db';
import { PocketBaseLearningGuideRepository } from '../repositories/pocketbase-learning-guide-repositories';
import { sampleLearningObjectives, createPrerequisiteRelationships } from '../data/sample-learning-objectives';

async function seedLearningObjectives() {
  try {
    console.log('Starting to seed learning objectives...');
    
    const pb = dbConnection.getPocketBase();
    const repository = new PocketBaseLearningGuideRepository(pb);
    
    // Check if objectives already exist
    const existingObjectives = await repository.objectives.findAll();
    if (existingObjectives.length > 0) {
      console.log(`Found ${existingObjectives.length} existing objectives. Skipping seed.`);
      return;
    }
    
    // Create objectives without prerequisites first
    console.log('Creating learning objectives...');
    const createdObjectives = [];
    
    for (const objectiveData of sampleLearningObjectives) {
      const created = await repository.objectives.create(objectiveData);
      createdObjectives.push(created);
      console.log(`Created objective: ${created.title}`);
    }
    
    // Now update with prerequisites
    console.log('Setting up prerequisite relationships...');
    const objectivesWithPrereqs = createPrerequisiteRelationships(createdObjectives);
    
    for (const objective of objectivesWithPrereqs) {
      if (objective.prerequisites.length > 0) {
        await repository.objectives.update(objective.id, {
          prerequisites: objective.prerequisites
        });
        console.log(`Updated prerequisites for: ${objective.title}`);
      }
    }
    
    console.log(`Successfully seeded ${createdObjectives.length} learning objectives!`);
    
  } catch (error) {
    console.error('Error seeding learning objectives:', error);
    throw error;
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedLearningObjectives()
    .then(() => {
      console.log('Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedLearningObjectives };