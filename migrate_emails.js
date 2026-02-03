const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './backend/.env' });

async function migrateEmails() {
    console.log('--- Starting Email Normalization Migration ---');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users to check.`);

        let updatedCount = 0;
        let skippedCount = 0;
        let errors = 0;

        for (const user of users) {
            const originalEmail = user.email;
            const normalizedEmail = originalEmail.trim().toLowerCase();

            // Check if update is needed
            if (originalEmail !== normalizedEmail) {
                console.log(`\nProcessing: "${originalEmail}" -> "${normalizedEmail}"`);

                // Check for potential conflict
                const conflictingUser = await User.findOne({ email: normalizedEmail });

                // If a user exists with the normalized email AND it's not the current user (different ID)
                if (conflictingUser && conflictingUser._id.toString() !== user._id.toString()) {
                    console.warn(`⚠️  CONFLICT: Cannot update user ${user._id}. Email "${normalizedEmail}" is already taken by user ${conflictingUser._id}.`);
                    console.warn(`   Action: SKIPPED. Please manually resolve this duplicate.`);
                    skippedCount++;
                    continue;
                }

                try {
                    // We must disable verification in the schema temporarily or update directly
                    // identifying validation errors isn't the goal here if we pre-validated
                    // But standard save() should work since we checked unique constraint above (mostly)
                    user.email = normalizedEmail;
                    await user.save();
                    console.log(`✅ Updated successfully.`);
                    updatedCount++;
                } catch (err) {
                    console.error(`❌ Error updating user ${user._id}:`, err.message);
                    errors++;
                }
            }
        }

        console.log('\n--- Migration Summary ---');
        console.log(`Total Scanned: ${users.length}`);
        console.log(`Updated: ${updatedCount}`);
        console.log(`Skipped (Conflicts): ${skippedCount}`);
        console.log(`Errors: ${errors}`);
        console.log('-------------------------');

    } catch (err) {
        console.error('Migration Failed:', err);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

migrateEmails();
