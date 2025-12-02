<script>
export default {
  onLaunch() {
    console.log('Practice App UI launched');
  },
  onShow() {
    console.log('Practice App UI shown');
  },
  onHide() {
    console.log('Practice App UI hidden');
  },
};
</script>

<style lang="scss">
@import '@/uni_modules/uni-scss/index.scss';
@import '@/static/customicons.css';

page {
  background-color: #f7f8fb;
  color: #1f2937;
}

.text-muted {
  color: #7b8794;
}

.section-card {
  background: #ffffff;
  border-radius: 18rpx;
  padding: 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(31, 56, 88, 0.06);
  margin-bottom: 20rpx;
}
</style>
