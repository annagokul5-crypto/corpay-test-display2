from sqlalchemy import Column, Integer, String, DateTime, Text, text
from sqlalchemy.sql import func
from app.database import Base


class EmployeeMilestone(Base):
    __tablename__ = "employee_milestones"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(String(200), nullable=False)
    avatar_path = Column(String(500))  # Path to uploaded image
    border_color = Column(String(7), nullable=False)  # Hex color
    background_color = Column(String(7), nullable=False)  # Hex color
    milestone_type = Column(String(50), nullable=False, index=True)  # 'anniversary', 'birthday', 'promotion', 'new_hire'
    department = Column(String(100))
    milestone_date = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Integer, default=1, server_default=text("1"))  # 1 for active, 0 for inactive

