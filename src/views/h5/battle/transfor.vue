<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

onMounted(() => {
	router.replace("/m/battleDetail?id=" + route.query.id + "&transfor=1");
});
</script>
