const axios = require('axios');
const schedule = require('node-schedule');
const fs = require('fs');
const XLSX = require('xlsx');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { BigQuery } = require('@google-cloud/bigquery');
const Sentry = require('@sentry/node');

// Inicialize o Sentry
//Sentry.init({ dsn: 'YOUR_SENTRY_DSN' });

const API_ENDPOINT = 'https://app.pipefy.com/graphql';
const TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJQaXBlZnkiLCJpYXQiOjE2OTc0NjczMDIsImp0aSI6ImM2YmM3MDEzLTM5YWYtNDY1Ni1hODM5LTU0YzI4ZGEzOTAwZiIsInN1YiI6MzAyMTIwNTMxLCJ1c2VyIjp7ImlkIjozMDIxMjA1MzEsImVtYWlsIjoidHJpYmUuZ21AdGVncnVzLnRlYW0iLCJhcHBsaWNhdGlvbiI6MzAwMjg0MDk0LCJzY29wZXMiOltdfSwiaW50ZXJmYWNlX3V1aWQiOm51bGx9.MydgEKIWMeLo085IEMRHmPeHhRHUQ_1uF_tWk8q1hTTjP9FVz32_StTYOU8Kk8nWTKMhCa7Ssz7CxDf-AvcLVw';

// Função para exportar relatório do Pipefy
async function exportPipeReport() {
    const mutation = `
        mutation {
            exportPipeReport(input: {pipeId: 302274681, pipeReportId: 300547495}) {
                pipeReportExport {
                    id
                }
            }
        }
    `;

    try {
        const response = await axios.post(API_ENDPOINT, { query: mutation }, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
        if (response.status === 200) {
            const reportId = response.data.data.exportPipeReport.pipeReportExport.id;
            console.log(`ID do relatório obtido: ${reportId}`);
            return reportId;
        } else {
            console.error(`Erro ao exportar relatório: ${response.status_code}`);
        }
    } catch (error) {
        console.error(error);
    }
    return null;
}

// Função para verificar o status do relatório e obter a URL para download
async function getReportStatusAndUrl(reportId) {
    while (true) {
        const query = `
            {
                pipeReportExport(id: "${reportId}") {
                    fileURL
                    state
                }
            }
        `;

        try {
            const response = await axios.post(API_ENDPOINT, { query }, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
            if (response.status === 200) {
                const reportExport = response.data.data.pipeReportExport;
                if (reportExport.state === "done") {
                    console.log("Relatório pronto para download.");
                    return reportExport.fileURL;
                } else {
                    console.log("Relatório ainda está sendo processado. Aguardando...");
                    await new Promise(resolve => setTimeout(resolve, 30000)); // Espera 30 segundos
                }
            } else {
                console.error(`Erro ao obter o status do relatório: ${response.status_code}`);
                break;
            }
        } catch (error) {
            console.error(error);
            break;
        }
    }
    return null;
}

// Função para fazer o download e converter o arquivo
async function downloadAndConvertFile(fileUrl) {
    try {
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        if (response.status === 200) {
            const xlsxPath = 'report.xlsx';
            fs.writeFileSync(xlsxPath, response.data);

            // Convertendo .xlsx para .csv
            const workbook = XLSX.readFile(xlsxPath);
            const sheetName = workbook.SheetNames[0];
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            const csvPath = 'report.csv';
            const csvWriter = createCsvWriter({
                path: csvPath,
                header: Object.keys(jsonData[0]).map(key => ({ id: key, title: key }))
            });

            await csvWriter.writeRecords(jsonData);
            console.log("Conversão para CSV concluída.");
        } else {
            console.error(`Erro ao fazer download do arquivo: ${response.status}`);
        }
    } catch (error) {
        console.error(error);
    }
}

// Função para fazer upload no BigQuery
async function uploadToBigQuery(csvPath = 'report.csv', datasetId = 'PipefyExportReport', tableId = 'reportCSV') {
    const bigqueryClient = new BigQuery();
    const metadata = {
        sourceFormat: 'CSV',
        skipLeadingRows: 1,
        autodetect: true,
    };

    try {
        await bigqueryClient
            .dataset(datasetId)
            .table(tableId)
            .load(csvPath, metadata);

        console.log(`Arquivo ${csvPath} enviado com sucesso para o BigQuery na tabela ${tableId}.`);
    } catch (error) {
        console.error(`Erro ao enviar arquivo para o BigQuery: ${error.message}`);
    }
}

// Função principal
async function main(pipeId, pipeReportId, datasetId, tableId, token) {
    try {
        const reportId = await exportPipeReport();
        if (reportId) {
            const fileUrl = await getReportStatusAndUrl(reportId);
            if (fileUrl) {
                await downloadAndConvertFile(fileUrl);
                await uploadToBigQuery();
            } else {
                console.log("URL do arquivo não obtida ou relatório ainda não está pronto.");
            }
        } else {
            console.log("Não foi possível obter o ID do relatório para exportação.");
        }
    } catch (error) {
        Sentry.captureException(error);
        console.error(error);
    }
}

module.exports = { main }