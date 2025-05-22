#!/usr/bin/env node

/**
 * Supabase Integration Test Script
 * 
 * This script tests the Supabase integration by connecting to your Supabase project,
 * verifying the database schema, and performing basic CRUD operations.
 * 
 * Usage:
 *   node test-supabase.js
 * 
 * Environment variables:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_ANON_KEY - Your Supabase anonymous key
 */

const { createClient } = require('@supabase/supabase-js');

// Check if Supabase credentials are provided
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials are not set.');
  console.error('Please set the following environment variables:');
  console.error('  export SUPABASE_URL=your_supabase_url');
  console.error('  export SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test functions
async function testConnection() {
  try {
    const { data, error } = await supabase.from('models').select('count()', { count: 'exact' });
    
    if (error) throw error;
    
    console.log('✅ Connection to Supabase successful');
    return true;
  } catch (error) {
    console.error('❌ Connection to Supabase failed:', error.message);
    return false;
  }
}

async function testSchema() {
  const tables = ['models', 'prompts', 'responses', 'consensus_groups'];
  const results = {};
  
  console.log('\nTesting database schema:');
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count()', { count: 'exact' });
      
      if (error) {
        console.error(`❌ Table '${table}' test failed:`, error.message);
        results[table] = false;
      } else {
        console.log(`✅ Table '${table}' exists with ${data[0].count} rows`);
        results[table] = true;
      }
    } catch (error) {
      console.error(`❌ Table '${table}' test failed:`, error.message);
      results[table] = false;
    }
  }
  
  return Object.values(results).every(result => result);
}

async function testCRUD() {
  console.log('\nTesting CRUD operations:');
  
  // Test model
  const testModel = {
    name: 'Test Model',
    provider: 'Test Provider',
    model_id: `test-model-${Date.now()}`,
    enabled: true
  };
  
  // Create
  try {
    const { data: createData, error: createError } = await supabase
      .from('models')
      .insert(testModel)
      .select();
    
    if (createError) throw createError;
    
    const modelId = createData[0].id;
    console.log(`✅ CREATE operation successful (ID: ${modelId})`);
    
    // Read
    const { data: readData, error: readError } = await supabase
      .from('models')
      .select('*')
      .eq('id', modelId)
      .single();
    
    if (readError) throw readError;
    
    console.log('✅ READ operation successful');
    
    // Update
    const { data: updateData, error: updateError } = await supabase
      .from('models')
      .update({ enabled: false })
      .eq('id', modelId)
      .select();
    
    if (updateError) throw updateError;
    
    console.log('✅ UPDATE operation successful');
    
    // Delete
    const { error: deleteError } = await supabase
      .from('models')
      .delete()
      .eq('id', modelId);
    
    if (deleteError) throw deleteError;
    
    console.log('✅ DELETE operation successful');
    
    return true;
  } catch (error) {
    console.error('❌ CRUD test failed:', error.message);
    return false;
  }
}

async function testPromptInsertion() {
  console.log('\nTesting prompt and response insertion:');
  
  try {
    // Insert a test prompt
    const { data: promptData, error: promptError } = await supabase
      .from('prompts')
      .insert({
        text: 'What is the capital of France?'
      })
      .select();
    
    if (promptError) throw promptError;
    
    const promptId = promptData[0].id;
    console.log(`✅ Prompt inserted successfully (ID: ${promptId})`);
    
    // Get a model to use for the response
    const { data: modelData, error: modelError } = await supabase
      .from('models')
      .select('id')
      .limit(1)
      .single();
    
    if (modelError) {
      console.log('⚠️ No models found, creating a test model');
      
      const { data: newModelData, error: newModelError } = await supabase
        .from('models')
        .insert({
          name: 'Test Model',
          provider: 'Test Provider',
          model_id: `test-model-${Date.now()}`,
          enabled: true
        })
        .select();
      
      if (newModelError) throw newModelError;
      
      var modelId = newModelData[0].id;
    } else {
      var modelId = modelData.id;
    }
    
    // Insert a test response
    const { data: responseData, error: responseError } = await supabase
      .from('responses')
      .insert({
        prompt_id: promptId,
        model_id: modelId,
        response_text: 'Paris',
        response_time_ms: 1200
      })
      .select();
    
    if (responseError) throw responseError;
    
    console.log('✅ Response inserted successfully');
    
    // Insert a test consensus group
    const { data: consensusData, error: consensusError } = await supabase
      .from('consensus_groups')
      .insert({
        prompt_id: promptId,
        group_name: 'paris',
        count: 1,
        color: '#3B82F6'
      })
      .select();
    
    if (consensusError) throw consensusError;
    
    console.log('✅ Consensus group inserted successfully');
    
    // Clean up
    const { error: deleteError } = await supabase
      .from('prompts')
      .delete()
      .eq('id', promptId);
    
    if (deleteError) throw deleteError;
    
    console.log('✅ Test data cleaned up successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Prompt insertion test failed:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('\n🔍 Supabase Integration Test');
  console.log('==========================');
  
  // Test connection
  const connectionSuccess = await testConnection();
  if (!connectionSuccess) {
    console.error('\n❌ Supabase connection test failed. Please check your credentials.');
    process.exit(1);
  }
  
  // Test schema
  const schemaSuccess = await testSchema();
  if (!schemaSuccess) {
    console.error('\n⚠️ Some tables are missing. Make sure to run the setup-supabase.sql script.');
  }
  
  // Test CRUD operations
  const crudSuccess = await testCRUD();
  if (!crudSuccess) {
    console.error('\n❌ CRUD operations test failed.');
    process.exit(1);
  }
  
  // Test prompt insertion
  const promptSuccess = await testPromptInsertion();
  if (!promptSuccess) {
    console.error('\n❌ Prompt insertion test failed.');
    process.exit(1);
  }
  
  console.log('\n✅ All tests completed successfully!');
  console.log('\nYour Supabase integration is working correctly.');
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});