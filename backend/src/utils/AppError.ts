// service/controller 各自包装异常时使用的业务错误，避免在全局错误处理器里吞掉错误码
export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
