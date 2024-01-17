const express = require('express');
const { saveReportData, getAllReportData, getReportById } = require('../database/database.js');
const app = express();
const { main } =  require('../index.js');  
app.use(express.json());

app.post('/uploadReport', async (req, res) => {
    try {
        const { pipeId, pipeReportId, datasetId, tableId, token } = req.body;

        const result = await main(pipeId, pipeReportId, datasetId, tableId, token);

        res.status(200).send({ message: 'Relatório processado com sucesso', result });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao processar relatório', error: error.message });
    }
});

app.post('/saveReport', async (req, res) => {
    try {
        console.log(req.body)
        const result = await saveReportData(req.body);
        console.log(result);
        res.status(200).send({ message: 'Dados salvos com sucesso', result });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao salvar dados', error: error.message });
    }
});

// Rota para obter todos os registros
app.get('/reports', async (req, res) => {
    try {
        const result = await getAllReportData()
        res.status(200).send({ message: 'Dados retornados com sucesso', result });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao buscar registros', error: error.message });
    }
});

// Rota para obter um único registro por ID
app.get('/reports/:id', async (req, res) => {
    const { id } = req.params; 
    try {
        const data = await getReportById(id);
        if (data) {
            res.status(200).send({ message: 'Relatório encontrado com sucesso!', data });
        } else {
            res.status(404).send({ message: 'Relatório não encontrado.' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Erro ao buscar registro', error: error.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});