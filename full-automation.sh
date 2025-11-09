  # Load secrets from .env if present
  if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
  fi

  # Prepare log file for artifact upload and notifications
  LOGFILE="automation-$(date +%Y%m%d-%H%M%S).log"
  exec > >(tee "$LOGFILE") 2>&1

  # CI/CD integration: set exit code for pipeline
  EXIT_CODE=0
#!/bin/bash
# Eazepay Universal - Full Automation Script

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

function validate_api_contract() {
  local dir=$1
  echo -e "${YELLOW}Validating API contract in $dir...${NC}"
  if ls "$dir" | grep -iE 'swagger|openapi'; then
    # Example: Use swagger-cli if available
    if command -v swagger-cli > /dev/null; then
      for spec in $(ls "$dir" | grep -iE 'swagger|openapi'); do
        if swagger-cli validate "$dir/$spec"; then
          echo -e "${GREEN}✅ $spec is valid in $dir${NC}"

      #!/bin/bash
      # Eazepay Universal - Full Automation Script (Refactored)

      RED='\033[0;31m'
      GREEN='\033[0;32m'
      YELLOW='\033[1;33m'
      BLUE='\033[0;34m'
      NC='\033[0m'

      # Load secrets from .env if present
      if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
      fi

      # Use ENV for environment profile
      ENV=${ENV:-dev}
      echo -e "${BLUE}Environment: $ENV${NC}"

      # Prepare log file for artifact upload and notifications
      LOGFILE="automation-$ENV-$(date +%Y%m%d-%H%M%S).log"
      exec > >(tee "$LOGFILE") 2>&1

      # CI/CD integration: set exit code for pipeline
      EXIT_CODE=0

      function validate_api_contract() {
        local dir=$1
        echo -e "${YELLOW}Validating API contract in $dir...${NC}"
        if ls "$dir" | grep -iE 'swagger|openapi'; then
          if command -v swagger-cli > /dev/null; then
            for spec in $(ls "$dir" | grep -iE 'swagger|openapi'); do
              if swagger-cli validate "$dir/$spec"; then
                echo -e "${GREEN}✅ $spec is valid in $dir${NC}"
              else
                echo -e "${RED}❌ $spec is invalid in $dir${NC}"
              fi
            done
          else
            echo -e "${YELLOW}⚠️ swagger-cli not installed, skipping validation.${NC}"
          fi
        else
          echo -e "${YELLOW}⚠️ No API spec found in $dir${NC}"
        fi
      }

      function verify_db_migrations() {
        local db=$1
        local script=$2
        echo -e "${YELLOW}Verifying DB migration for $db...${NC}"
        if [ -f "$script" ]; then
          if echo "$script" | grep -E '\.sql$'; then
            echo -e "${BLUE}Simulating SQL migration: $script${NC}"
            head -20 "$script"
          elif echo "$script" | grep -E '\.js$'; then
            echo -e "${BLUE}Simulating JS migration: $script${NC}"
            head -20 "$script"
          else
            echo -e "${YELLOW}Unknown migration script type: $script${NC}"
          fi
          echo -e "${GREEN}✅ Migration script present for $db${NC}"
        else
          echo -e "${RED}❌ Migration script missing for $db${NC}"
        fi
      }

      function check_monitoring_logging() {
        local dir=$1
        echo -e "${YELLOW}Checking monitoring/logging config in $dir...${NC}"
        if ls "$dir" | grep -iE 'logger|monitor|prometheus|grafana'; then
          echo -e "${GREEN}✅ Monitoring/logging config found in $dir${NC}"
        else
          echo -e "${YELLOW}⚠️ No monitoring/logging config found in $dir${NC}"
        fi
      }

      function build_docker_image() {
        local dir=$1
        local name=$(basename $dir)
        local tag="${IMAGE_TAG:-latest}"
        local image="$DOCKER_REGISTRY/$DOCKER_USER/$name:$tag"
        echo -e "${YELLOW}Building Docker image for $name with tag $tag...${NC}"
        if [ -f "$dir/Dockerfile" ]; then
          if docker build -t "$image" "$dir"; then
            echo -e "${GREEN}✅ Docker image built for $name${NC}"
            push_docker_image "$image"
          else
            echo -e "${RED}❌ Docker build failed for $name${NC}"
          fi
        else
          echo -e "${YELLOW}No Dockerfile found in $dir, skipping build.${NC}"
        fi
      }

      function push_docker_image() {
        local image=$1
        echo -e "${YELLOW}Pushing Docker image $image to registry...${NC}"
        if docker push "$image"; then
          echo -e "${GREEN}✅ Docker image pushed: $image${NC}"
        else
          echo -e "${RED}❌ Docker image push failed: $image${NC}"
        fi
      }

      # Docker login automation (non-interactive, secrets management)
      echo -e "${YELLOW}Logging in to Docker Hub...${NC}"
      DOCKER_USER="${DOCKER_USER:-mokua2025}"
      DOCKER_REGISTRY="${DOCKER_REGISTRY:-docker.io}"
      if [ -z "$DOCKER_PASS" ]; then
        if ! docker info | grep -q "Username: $DOCKER_USER"; then
          read -s -p "Docker Hub Password for $DOCKER_USER: " DOCKER_PASS
          echo
        fi
      fi
      if ! docker info | grep -q "Username: $DOCKER_USER"; then
        echo "$DOCKER_PASS" | docker login --username "$DOCKER_USER" --password-stdin
        if [ $? -eq 0 ]; then
          echo -e "${GREEN}✅ Docker login successful${NC}"
        else
          echo -e "${RED}❌ Docker login failed. Exiting.${NC}"
          EXIT_CODE=1
          exit $EXIT_CODE
        fi
      else
        echo -e "${GREEN}Already logged in as $DOCKER_USER${NC}"
      fi

      # Service selection from .env
      IFS=',' read -ra SERVICE_LIST <<< "$SERVICES"

      # Step toggles from .env
      STEPS=""
      [ "$RUN_TESTS" = "true" ] && STEPS="$STEPS test"
      [ "$RUN_LINT" = "true" ] && STEPS="$STEPS lint"
      [ "$RUN_BUILD" = "true" ] && STEPS="$STEPS build"
      [ "$RUN_SECURITY" = "true" ] && STEPS="$STEPS security"
      STEPS="$STEPS api db monitor docker"
      if [ $# -gt 0 ]; then
        STEPS="$@"
      fi

      # API contract validation
      if echo "$STEPS" | grep -qw api; then
        for svc in "${SERVICE_LIST[@]}"; do
          validate_api_contract "services/$svc"
        done
      fi

      # DB migration verification
      if echo "$STEPS" | grep -qw db; then
        verify_db_migrations "PostgreSQL" "infrastructure/docker/postgres/init.sql"
        verify_db_migrations "MongoDB" "infrastructure/docker/mongodb/init.js"
        verify_db_migrations "RabbitMQ" "infrastructure/docker/rabbitmq/definitions.json"
      fi

      # Monitoring/logging config checks
      if echo "$STEPS" | grep -qw monitor; then
        check_monitoring_logging "infrastructure/docker/prometheus"
        check_monitoring_logging "infrastructure/docker/grafana"
        for svc in "${SERVICE_LIST[@]}"; do
          check_monitoring_logging "services/$svc/src/utils"
        done
      fi

      # Docker image build & push
      if echo "$STEPS" | grep -qw docker; then
        for svc in "${SERVICE_LIST[@]}"; do
          build_docker_image "services/$svc"
        done
      fi

      # End-to-end/integration test orchestration
      if echo "$STEPS" | grep -qw test; then
        echo -e "\n${BLUE}🔗 Running integration/end-to-end tests...${NC}"
        if [ -f "scripts/testing/integration-test.sh" ]; then
          bash scripts/testing/integration-test.sh && echo -e "${GREEN}✅ Integration tests passed${NC}" || echo -e "${RED}❌ Integration tests failed${NC}"
        else
          echo -e "${YELLOW}No integration-test.sh found, skipping integration tests.${NC}"
        fi
        if [ -f "scripts/testing/test-services.sh" ]; then
          bash scripts/testing/test-services.sh && echo -e "${GREEN}✅ Service tests passed${NC}" || echo -e "${RED}❌ Service tests failed${NC}"
        else
          echo -e "${YELLOW}No test-services.sh found, skipping service tests.${NC}"
        fi
      fi

      # Slack/Webhook notifications
      if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' --data '{"text":"Eazepay Automation Results '$ENV' - See attached log."}' "$SLACK_WEBHOOK_URL"
      fi
      if [ ! -z "$WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' --data '{"result":"Eazepay Automation Results '$ENV'","log":"'$LOGFILE'"}' "$WEBHOOK_URL"
      fi

      # Email notification: send log summary if EMAIL_TO is set
      if [ ! -z "$EMAIL_TO" ]; then
        SUBJECT="Eazepay Automation Results $ENV $(date +%Y-%m-%d)"
        RECIPIENTS="$EMAIL_TO"
        [ ! -z "$EMAIL_CC" ] && RECIPIENTS="$RECIPIENTS,$EMAIL_CC"
        [ ! -z "$EMAIL_BCC" ] && RECIPIENTS="$RECIPIENTS,$EMAIL_BCC"
        mail -s "$SUBJECT" "$RECIPIENTS" < "$LOGFILE"
        if [ $? -eq 0 ]; then
          echo -e "${GREEN}✅ Email notification sent to $RECIPIENTS${NC}"
        else
          echo -e "${RED}❌ Email notification failed${NC}"
        fi
      fi

      # Artifact upload: upload log to S3/GCS/Azure if credentials and bucket/container are set
      if [ ! -z "$AWS_ACCESS_KEY_ID" ] && [ ! -z "$AWS_SECRET_ACCESS_KEY" ] && [ ! -z "$S3_BUCKET" ]; then
        aws s3 cp "$LOGFILE" "s3://$S3_BUCKET/$LOGFILE"
        if [ $? -eq 0 ]; then
          echo -e "${GREEN}✅ Log uploaded to S3: $S3_BUCKET/$LOGFILE${NC}"
        else
          echo -e "${RED}❌ Log upload to S3 failed${NC}"
          EXIT_CODE=1
        fi
      fi
      if [ ! -z "$GCS_BUCKET" ]; then
        gsutil cp "$LOGFILE" "gs://$GCS_BUCKET/$LOGFILE"
        if [ $? -eq 0 ]; then
          echo -e "${GREEN}✅ Log uploaded to GCS: $GCS_BUCKET/$LOGFILE${NC}"
        else
          echo -e "${RED}❌ Log upload to GCS failed${NC}"
          EXIT_CODE=1
        fi
      fi
      if [ ! -z "$AZURE_CONTAINER" ]; then
        az storage blob upload --container-name "$AZURE_CONTAINER" --file "$LOGFILE" --name "$LOGFILE"
        if [ $? -eq 0 ]; then
          echo -e "${GREEN}✅ Log uploaded to Azure: $AZURE_CONTAINER/$LOGFILE${NC}"
        else
          echo -e "${RED}❌ Log upload to Azure failed${NC}"
          EXIT_CODE=1
        fi
      fi

      # Placeholder for dotenv-vault integration
      if [ ! -z "$DOTENV_VAULT_KEY" ]; then
        echo "[INFO] dotenv-vault integration would be handled here."
      fi

      echo -e "\n${GREEN}✅ Full automation checks complete!${NC}"
      exit $EXIT_CODE
