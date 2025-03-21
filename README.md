# 📊 Pipefy Report Automation to BigQuery

Este projeto automatiza a exportação de relatórios do Pipefy, realiza a conversão do arquivo `.xlsx` para `.csv` e faz o upload direto para uma tabela no BigQuery.

> Desenvolvido em **Node.js** com foco em **automação de tarefas**, **integração via API GraphQL**, **manipulação de arquivos** e **carga de dados em nuvem**.

---

## 🚀 Funcionalidades

- 🔐 Acessa a API do Pipefy via GraphQL  
- 📥 Exporta relatórios de Pipes configurados  
- ⏳ Verifica o status de processamento do relatório  
- 📁 Faz o download do arquivo gerado em `.xlsx`  
- 🔄 Converte para `.csv` com estrutura de colunas automática  
- ☁️ Envia o arquivo final para uma tabela no Google BigQuery  
- 🧩 Preparado para agendamento com `node-schedule` (caso necessário)  
- 📡 Suporte para integração com **Sentry** (monitoramento de erros)  

---

## 📂 Estrutura do projeto

```
.
├── index.js (ou use a função main exportada)
├── report.xlsx (gerado dinamicamente)
├── report.csv (convertido automaticamente)
└── README.md
```

---

## 🛠️ Tecnologias e bibliotecas utilizadas

- [Node.js](https://nodejs.org/)
- [Axios](https://www.npmjs.com/package/axios) – chamadas HTTP
- [Node Schedule](https://www.npmjs.com/package/node-schedule) – agendamento de tarefas (opcional)
- [XLSX](https://www.npmjs.com/package/xlsx) – leitura e conversão de planilhas
- [csv-writer](https://www.npmjs.com/package/csv-writer) – geração de arquivos CSV
- [Google Cloud BigQuery](https://cloud.google.com/bigquery) – carga de dados na nuvem
- [Sentry](https://sentry.io/) – logging e rastreamento de erros (opcional)

---

## ⚙️ Como usar

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/pipefy-bigquery-automation.git
cd pipefy-bigquery-automation
```

2. Instale as dependências:

```bash
npm install
```

3. Configure suas variáveis:
   - Atualize `YOUR_TOKEN_HERE`, `YOUR_PIPE_ID` e `YOUR_PIPE_REPORT_ID` no código.
   - Opcional: adicione sua DSN do Sentry.

4. Execute a função principal:

```bash
node index.js
```

Ou use a função exportada `main()` passando os parâmetros dinamicamente:

```js
main(pipeId, pipeReportId, datasetId, tableId, token);
```

---

## 🧪 Exemplo de uso

```js
const { main } = require('./index');

main(
  123456,                    // pipeId
  987654,                    // pipeReportId
  'PipefyExportReport',      // BigQuery datasetId
  'reportCSV',               // BigQuery tableId
  'seu_token_aqui'           // Pipefy API Token
);
```

---

## ✅ Requisitos

- Conta no [Google Cloud](https://cloud.google.com/)
- Projeto e dataset criados no BigQuery
- Chave de autenticação configurada para acesso ao BigQuery via Node.js
- Permissões de acesso ao Pipefy com token válido

---

## 📌 Observações

- O código aguarda 30 segundos entre as verificações do status do relatório.
- O nome dos arquivos gerados (`report.xlsx` e `report.csv`) é fixo, mas pode ser facilmente parametrizado.
- Adicione `node-schedule` para agendar execuções automáticas.

---

## 👨‍💻 Autor

**Talles Nicacio**  
