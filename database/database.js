const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/Users/tallesnicacio/Desktop/Exportify NodeJS/.env' });
const supabaseUrl = process.env.supabaseUrl;
const supabaseKey = process.env.supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

async function saveReportData(data) {
    const { pipeId, pipeReportId, reportId, datasetId, tableId, token } = data;

    const response = await supabase
        .from('reports')
        .insert([
            { pipeId, pipeReportId, reportId, datasetId, tableId, token }
        ]);

    console.log(response)
    return data;
}

async function getAllReportData() {
    const { data, error } = await supabase.from('reports').select('*');
    if (error) throw error;
    return data;
}


async function getReportById(id) {
    const { data, error } = await supabase.from('reports').select('*').eq('id', id).single();
    console.log(data)
    if (error) throw error;
    return data; 
}

module.exports = { saveReportData, getAllReportData, getReportById };