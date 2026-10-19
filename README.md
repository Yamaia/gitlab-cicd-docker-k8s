# 🚀 gitlab-cicd-docker-k8s

Aplicação **Node.js (Express)** levada do commit à produção com pipelines no **GitLab CI/CD**, em dois cenários independentes, cada um em sua branch:

| Branch | Deploy | Destino |
|--------|--------|---------|
| `docker` | Container Docker via SSH | Servidor (VM) |
| `kubernetes` | Deployment + Service LoadBalancer | Cluster GKE (Google Cloud) |
| `main` | Apenas testes | – |

Projeto do desafio da [DIO](https://www.dio.me/), a partir de [denilsonbonatti/gitlab-cicd-app-base](https://gitlab.com/denilsonbonatti/gitlab-cicd-app-base).

## 📖 Sobre o projeto

O objetivo é automatizar todo o caminho de uma aplicação: a cada `git push`, o GitLab executa os testes, constrói a imagem Docker, publica no Container Registry da minha conta e faz o deploy. Os dois pipelines são independentes e cada um só roda na sua própria branch.

## 🏗️ Arquitetura

**Cenário Docker**
```
commit na branch docker → GitLab CI → test (Jest) → build (Docker + push no GitLab Registry)
→ deploy (SSH no servidor: docker pull + docker run -p 80:3000) → http://IP-DO-SERVIDOR
```

**Cenário Kubernetes**
```
commit na branch kubernetes → GitLab CI → test (Jest) → build (Docker + push no GitLab Registry)
→ deploy (gcloud + kubectl apply) → GKE: Deployment (3 réplicas) + Service LoadBalancer → http://IP-EXTERNO
```

## 📁 Estrutura

```
.
├── src/
│   ├── app.js          # rotas Express
│   └── server.js       # inicialização do servidor
├── tests/
│   └── app.test.js     # testes Jest + Supertest
├── k8s/
│   └── deployment.yaml # Deployment + Service (branch kubernetes)
├── Dockerfile
├── .gitlab-ci.yml      # pipeline (diferente em cada branch)
└── package.json
```

## ⚙️ Stages e jobs

| Stage | Job | O que faz |
|-------|-----|-----------|
| `test` | `test` | `npm ci` e `npm test` (Jest + Supertest, testando as rotas de verdade) |
| `build` | `build` | Constrói a imagem e publica no **GitLab Container Registry** da própria conta, com tag do SHA do commit e `latest` |
| `deploy` | `deploy` | Docker: SSH + `docker run`. Kubernetes: `kubectl apply` do manifesto em `k8s/` |

### Como cada pipeline fica preso à sua branch

Cada branch tem seu próprio `.gitlab-ci.yml`, e o bloco `workflow:rules` impede que o pipeline rode em qualquer outra branch:

```yaml
workflow:
  rules:
    - if: $CI_COMMIT_BRANCH == "docker"   # na branch kubernetes: == "kubernetes"
```

## 🔐 Variáveis de CI/CD (Settings → CI/CD → Variables)

Nenhum segredo fica versionado. O registro usa as variáveis predefinidas do GitLab (`CI_REGISTRY*`).

**Branch `docker`**

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `SSH_PRIVATE_KEY` | File | Chave privada para acessar o servidor |
| `SERVER_HOST` | Variable | IP ou domínio do servidor |
| `SERVER_USER` | Variable | Usuário SSH |

**Branch `kubernetes`**

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `GCP_SA_KEY` | File | JSON da service account (papel *Kubernetes Engine Developer*) |
| `GCP_PROJECT` | Variable | ID do projeto no Google Cloud |
| `GKE_CLUSTER` | Variable | Nome do cluster |
| `GKE_ZONE` | Variable | Zona do cluster (ex.: `us-central1-a`) |
| `REGISTRY_DEPLOY_USER` | Variable | Usuário do *deploy token* (escopo `read_registry`) |
| `REGISTRY_DEPLOY_TOKEN` | Variable (masked) | Token usado pelo cluster para baixar a imagem |

## 🌐 Como acessar a aplicação

- **Docker:** `http://<SERVER_HOST>` (porta 80 do servidor → 3000 do container)
- **Kubernetes:** `kubectl get service gitlab-cicd-app` e use o `EXTERNAL-IP`. Cada requisição a `/` mostra o `hostname` do pod que respondeu, evidenciando as 3 réplicas.

Rotas: `GET /` (mensagem, versão e hostname) e `GET /health` (health check).

## 🔄 O que mudei em relação ao exemplo do expert

- Pipeline **preso à sua branch** com `workflow:rules`
- Imagem publicada no **registro da minha conta**, sem depender de conta de terceiros
- **Tag nova a cada build** (SHA do commit), em vez de reutilizar sempre a mesma; o deploy usa essa tag
- **Node 20 alinhado** no Dockerfile e em todos os pipelines
- **Testes que acessam a aplicação** (Supertest), e não só conferem se arquivos existem
- Container roda com usuário **não-root**, e o Kubernetes usa **readiness/liveness probes** e limites de recursos
- Segredos exclusivamente em variáveis de CI/CD

## 📸 Evidências

![Pipeline docker](images/pipeline-docker.png)
![Aplicação no servidor](images/app-docker.png)
![Pipeline kubernetes](images/pipeline-kubernetes.png)
![Aplicação no GKE](images/app-kubernetes.png)

## ▶️ Executar localmente

```bash
npm ci && npm test
docker build -t gitlab-cicd-app . && docker run -p 3000:3000 gitlab-cicd-app
```

## 👨‍💻 Autor

Feito por **Yamaia**, desenvolvedor Python, FastAPI e React, com foco em Azure e cloud.
