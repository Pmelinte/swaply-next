require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');

// Conectare la Supabase folosind Service Role Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  try {
    // 1. USERS
    const users = Array.from({ length: 10 }).map(() => ({
      id: faker.string.uuid(),
      email: faker.internet.email(),
    }));
    await supabase.from('users').insert(users);
    console.log(`✅ Inserat ${users.length} users`);

    // 2. OBJECTS
    const objects = Array.from({ length: 15 }).map(() => ({
      id: faker.string.uuid(),
      user_id: faker.helpers.arrayElement(users).id,
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
    }));
    await supabase.from('objects').insert(objects);
    console.log(`✅ Inserat ${objects.length} objects`);

    // 3. WISHES
    const wishes = Array.from({ length: 10 }).map(() => ({
      id: faker.string.uuid(),
      user_id: faker.helpers.arrayElement(users).id,
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
    }));
    await supabase.from('wishes').insert(wishes);
    console.log(`✅ Inserat ${wishes.length} wishes`);

    // 4. MESSAGES
    const messages = Array.from({ length: 20 }).map(() => {
      const from = faker.helpers.arrayElement(users).id;
      let to = faker.helpers.arrayElement(users).id;
      while (to === from) to = faker.helpers.arrayElement(users).id;
      return {
        id: faker.string.uuid(),
        from_user_id: from,
        to_user_id: to,
        text: faker.lorem.sentence(),
      };
    });
    await supabase.from('messages').insert(messages);
    console.log(`✅ Inserat ${messages.length} messages`);

    // 5. FEEDBACK
    const feedback = Array.from({ length: 10 }).map(() => {
      const from = faker.helpers.arrayElement(users).id;
      let to = faker.helpers.arrayElement(users).id;
      while (to === from) to = faker.helpers.arrayElement(users).id;
      return {
        id: faker.string.uuid(),
        from_user_id: from,
        to_user_id: to,
        comment: faker.lorem.sentence(),
      };
    });
    await supabase.from('feedback').insert(feedback);
    console.log(`✅ Inserat ${feedback.length} feedback`);

    console.log('🌱 Seeding complet!');
  } catch (err) {
    console.error('❌ Eroare la seeding:', err);
  }
}

seed();
